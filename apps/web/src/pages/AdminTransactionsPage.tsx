import {
  ArrowLeft,
  LoaderCircle,
  ReceiptText,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ContributionGrid } from '../components/admin/ContributionGrid';
import {
  listAdminParticipants,
  listAdminTransactions,
} from '../services/admin-api';
import { getAuthSession } from '../services/auth-session';
import type {
  AdminParticipant,
  AdminTransaction,
} from '../types/admin';
import './Admin.css';
import './AdminTransactions.css';
import './AdminTransactionsResponsive.css';

export function AdminTransactionsPage() {
  const navigate = useNavigate();
  const session = getAuthSession();
  const [year, setYear] = useState(new Date().getFullYear());
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [participants, setParticipants] = useState<AdminParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleSessionError = useCallback(
    (message: string) => {
      if (message.includes('Sessão')) {
        navigate('/admin/login', { replace: true });
        return true;
      }

      return false;
    },
    [navigate],
  );

  const loadData = useCallback(async () => {
    try {
      setError('');

      const [transactionsResponse, participantsResponse] =
        await Promise.all([
          listAdminTransactions(),
          listAdminParticipants(),
        ]);

      setTransactions(transactionsResponse);
      setParticipants(
        participantsResponse.filter(
          (participant) => participant.isActive,
        ),
      );
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Não foi possível carregar as movimentações.';

      if (!handleSessionError(message)) {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [handleSessionError]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadData]);

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <main className="admin-transactions-page">
      <header className="admin-inner-header">
        <div className="admin-inner-brand">
          <span>
            <ReceiptText size={24} />
          </span>
          <div>
            <strong>Controle de contribuições</strong>
            <small>Planilha financeira do grupo</small>
          </div>
        </div>

        <Link className="admin-back-button" to="/admin">
          <ArrowLeft size={17} />
          Voltar
        </Link>
      </header>

      <section className="transactions-content">
        <div className="transactions-title">
          <div>
            <span className="admin-eyebrow">Contribuições</span>
            <h1>Pagamentos mensais</h1>
            <p>Adicione ou remova valores diretamente na tabela.</p>
            <Link
              to="/admin/transactions/history"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                marginTop: 12,
                padding: '10px 16px',
                borderRadius: 10,
                background: '#bd3624',
                color: '#ffffff',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Ver histórico e excluir movimentações →
            </Link>
          </div>

          <label className="year-selector">
            Ano
            <select
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
            >
              {[year - 1, year, year + 1].map((optionYear) => (
                <option key={optionYear} value={optionYear}>
                  {optionYear}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <div className="admin-feedback error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="admin-loading">
            <LoaderCircle className="admin-spinner" size={25} />
            Carregando contribuições...
          </div>
        ) : (
          <ContributionGrid
            onChanged={loadData}
            onError={(message) => {
              if (!handleSessionError(message)) {
                setError(message);
              }
            }}
            participants={participants}
            transactions={transactions}
            year={year}
          />
        )}
      </section>
    </main>
  );
}
