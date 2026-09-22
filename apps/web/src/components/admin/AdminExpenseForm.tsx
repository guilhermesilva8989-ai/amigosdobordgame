import {
  ArrowDownRight,
  LoaderCircle,
} from 'lucide-react';
import {
  type FormEvent,
  useState,
} from 'react';
import { createAdminTransaction } from '../../services/admin-api';

interface AdminExpenseFormProps {
  onCreated: () => Promise<void>;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

function getToday() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

export function AdminExpenseForm({
  onCreated,
  onError,
  onSuccess,
}: AdminExpenseFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [occurredAt, setOccurredAt] = useState(getToday);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedAmount = amount.trim().replace(',', '.');
    const numericAmount = Number(normalizedAmount);

    if (!description.trim()) {
      onError('Digite uma descrição para a despesa.');
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      onError('Digite um valor maior que zero.');
      return;
    }

    try {
      setSubmitting(true);
      onError('');
      onSuccess('');

      await createAdminTransaction({
        type: 'EXPENSE',
        amount: normalizedAmount,
        description: description.trim(),
        occurredAt: new Date(
          `${occurredAt}T12:00:00`,
        ).toISOString(),
      });

      setDescription('');
      setAmount('');
      setOccurredAt(getToday());
      await onCreated();
      onSuccess('Despesa registrada com sucesso.');
    } catch (caughtError) {
      onError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Não foi possível registrar a despesa.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <label className="expense-description">
        <span>Descrição</span>
        <input
          maxLength={255}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Ex.: Compra de novos jogos"
          value={description}
        />
      </label>

      <label>
        <span>Valor</span>
        <div className="expense-amount-input">
          <span>R$</span>
          <input
            inputMode="decimal"
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0,00"
            value={amount}
          />
        </div>
      </label>

      <label>
        <span>Data</span>
        <input
          max={getToday()}
          onChange={(event) => setOccurredAt(event.target.value)}
          type="date"
          value={occurredAt}
        />
      </label>

      <button disabled={submitting} type="submit">
        {submitting ? (
          <LoaderCircle className="admin-spinner" size={18} />
        ) : (
          <ArrowDownRight size={18} />
        )}
        {submitting ? 'Salvando...' : 'Adicionar despesa'}
      </button>
    </form>
  );
}
