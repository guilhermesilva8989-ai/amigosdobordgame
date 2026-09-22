import {
  ArrowDownRight,
  ArrowLeft,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AdminExpenseForm } from '../components/admin/AdminExpenseForm';
import { AdminExpenseList } from '../components/admin/AdminExpenseList';
import { listAdminTransactions } from '../services/admin-api';
import { getAuthSession } from '../services/auth-session';
import type { AdminTransaction } from '../types/admin';
import './Admin.css';
import './AdminExpenses.css';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

export function AdminExpensesPage() {
  const navigate = useNavigate();
  const session = getAuthSession();
  const [expenses, setExpenses] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleError = useCallback(
    (message: string) => {
      if (message.includes('Sessão')) {
        navigate('/admin/login', { replace: true });
        return;
      }

      setError(message);
    },
    [navigate],
  );

  const loadExpenses = useCallback(async () => {
    try {
      setError('');

      const transactions = await listAdminTransactions();

      setExpenses(
        transactions.filter(
          (transaction) => transaction.type === 'EXPENSE',
        ),
      );
    } catch (caughtError) {
      handleError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Não foi possível carregar as despesas.',
      );
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadExpenses();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadExpenses]);

  const totalExpenses = useMemo(
    () =>
      expenses.reduce(
        (total, expense) => total + Number(expense.amount),
        0,
      ),
    [expenses],
  );

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <main className="admin-expenses-page">
      <header className="admin-inner-header expenses-header">
        <div className="admin-inner-brand expenses-brand">
          <span>
            <ArrowDownRight size={24} />
          </span>
          <div>
            <strong>Controle de despesas</strong>
            <small>Saídas do fundo coletivo</small>
          </div>
        </div>

        <Link className="admin-back-button" to="/admin">
          <ArrowLeft size={17} />
          Voltar
        </Link>
      </header>

      <section className="expenses-content">
        <div className="expenses-heading">
          <div>
            <span className="admin-eyebrow">Despesas</span>
            <h1>Saídas do grupo</h1>
            <p>Registre compras, materiais e outros gastos.</p>
          </div>

          <div className="expenses-total">
            <span>Total registrado</span>
            <strong>{formatCurrency(totalExpenses)}</strong>
          </div>
        </div>

        <AdminExpenseForm
          onCreated={loadExpenses}
          onError={handleError}
          onSuccess={setSuccess}
        />

        {error && (
          <div className="admin-feedback error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="expense-feedback-success" role="status">
            {success}
          </div>
        )}

        <section className="expense-list-section">
          <div className="expense-list-heading">
            <div>
              <span>Histórico</span>
              <h2>Despesas registradas</h2>
            </div>
            <strong>{expenses.length} registros</strong>
          </div>

          <AdminExpenseList
            expenses={expenses}
            loading={loading}
            onError={handleError}
            onRemoved={(expenseId) => {
              setExpenses((current) =>
                current.filter((item) => item.id !== expenseId),
              );
            }}
            onSuccess={setSuccess}
          />
        </section>
      </section>
    </main>
  );
}
