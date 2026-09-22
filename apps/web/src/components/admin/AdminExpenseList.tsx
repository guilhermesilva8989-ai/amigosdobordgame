import {
  ArrowDownRight,
  LoaderCircle,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { removeAdminTransaction } from '../../services/admin-api';
import type { AdminTransaction } from '../../types/admin';

interface AdminExpenseListProps {
  expenses: AdminTransaction[];
  loading: boolean;
  onRemoved: (expenseId: string) => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('pt-BR').format(new Date(value));

export function AdminExpenseList({
  expenses,
  loading,
  onRemoved,
  onError,
  onSuccess,
}: AdminExpenseListProps) {
  const [removingId, setRemovingId] = useState('');

  async function handleRemove(expense: AdminTransaction) {
    const confirmed = window.confirm(
      `Remover a despesa "${expense.description}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingId(expense.id);
      onError('');
      onSuccess('');

      await removeAdminTransaction(expense.id);
      onRemoved(expense.id);
      onSuccess('Despesa removida com sucesso.');
    } catch (caughtError) {
      onError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Não foi possível remover a despesa.',
      );
    } finally {
      setRemovingId('');
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <LoaderCircle className="admin-spinner" size={24} />
        Carregando despesas...
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="expense-empty">
        Nenhuma despesa foi registrada.
      </div>
    );
  }

  return (
    <div className="expense-list">
      {expenses.map((expense) => (
        <article key={expense.id}>
          <span className="expense-list-icon">
            <ArrowDownRight size={19} />
          </span>

          <div className="expense-list-description">
            <strong>{expense.description}</strong>
            <span>{formatDate(expense.occurredAt)}</span>
          </div>

          <strong className="expense-list-value">
            − {formatCurrency(Number(expense.amount))}
          </strong>

          <button
            aria-label={`Remover ${expense.description}`}
            disabled={removingId === expense.id}
            onClick={() => void handleRemove(expense)}
            type="button"
          >
            {removingId === expense.id ? (
              <LoaderCircle className="admin-spinner" size={17} />
            ) : (
              <Trash2 size={17} />
            )}
          </button>
        </article>
      ))}
    </div>
  );
}
