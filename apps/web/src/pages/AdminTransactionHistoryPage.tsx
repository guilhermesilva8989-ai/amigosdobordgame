import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  listAdminTransactions,
  removeAdminTransaction,
} from '../services/admin-api';
import { getAuthSession } from '../services/auth-session';
import type { AdminTransaction } from '../types/admin';
import './AdminTransactionHistory.css';

const formatCurrency = (value: string) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value));

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('pt-BR').format(new Date(value));

export function AdminTransactionHistoryPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!getAuthSession()) {
      navigate('/admin/login', { replace: true });
      return;
    }

    let cancelled = false;

    void listAdminTransactions()
      .then((items) => {
        if (!cancelled) {
          setTransactions(items);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar as movimentações.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleRemove(transaction: AdminTransaction) {
    const label =
      transaction.type === 'ENTRY' ? 'entrada' : 'despesa';

    if (
      !window.confirm(
        'Excluir a ' + label + ' "' + transaction.description +
        '" de ' + formatCurrency(transaction.amount) +
        '? O saldo será recalculado.',
      )
    ) {
      return;
    }

    setRemovingId(transaction.id);
    setErrorMessage('');

    try {
      await removeAdminTransaction(transaction.id);
      setTransactions((current) =>
        current.filter((item) => item.id !== transaction.id),
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir a movimentação.';

      setErrorMessage(message);

      if (message.includes('Sessão')) {
        navigate('/admin/login', { replace: true });
      }
    } finally {
      setRemovingId(null);
    }
  }

  const visibleTransactions = transactions.filter((transaction) =>
    (
      transaction.description + ' ' +
      (transaction.participant?.name ?? '') + ' ' +
      transaction.amount
    ).toLocaleLowerCase('pt-BR').includes(
      search.trim().toLocaleLowerCase('pt-BR'),
    ),
  );

  return (
    <div className="transaction-history-page">
      <header className="transaction-history-header">
        <div>
          <small>ÁREA ADMINISTRATIVA</small>
          <h1 style={{ color: "#fffaf3" }}>Histórico de movimentações</h1>
          <p>Entradas e despesas registradas no fundo.</p>
        </div>
        <Link to="/admin">Voltar ao painel</Link>
      </header>

      <main className="transaction-history-main">
        <div className="transaction-history-toolbar">
          <div>
            <h2>Todas as movimentações</h2>
            <p>{transactions.length} registros</p>
          </div>
          <label>
            Buscar por descrição, participante ou valor
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ex.: Entrada de teste"
            />
          </label>
        </div>

        {errorMessage && (
          <p className="transaction-history-error" role="alert">
            {errorMessage}
          </p>
        )}

        {loading ? (
          <p className="transaction-history-empty">Carregando...</p>
        ) : visibleTransactions.length === 0 ? (
          <p className="transaction-history-empty">
            Nenhuma movimentação encontrada.
          </p>
        ) : (
          <div className="transaction-history-list">
            {visibleTransactions.map((transaction) => (
              <article
                className="transaction-history-item"
                key={transaction.id}
              >
                <div>
                  <span className="transaction-history-type">
                    {transaction.type === 'ENTRY'
                      ? 'Entrada'
                      : 'Despesa'}
                  </span>
                  <h3>{transaction.description}</h3>
                  <p>
                    {transaction.participant?.name ?? 'Fundo coletivo'}
                    {' · '}
                    {formatDate(transaction.occurredAt)}
                  </p>
                </div>

                <strong>{formatCurrency(transaction.amount)}</strong>

                <button
                  type="button"
                  disabled={removingId !== null}
                  onClick={() => void handleRemove(transaction)}
                  aria-label={
                    'Excluir movimentação: ' +
                    transaction.description
                  }
                >
                  {removingId === transaction.id
                    ? 'Excluindo...'
                    : 'Excluir'}
                </button>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
