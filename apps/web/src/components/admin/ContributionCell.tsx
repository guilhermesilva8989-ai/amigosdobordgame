import {
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  createAdminTransaction,
  removeAdminTransaction,
  updateAdminTransaction,
} from '../../services/admin-api';
import type {
  AdminParticipant,
  AdminTransaction,
} from '../../types/admin';

interface ContributionCellProps {
  participant: AdminParticipant;
  transaction?: AdminTransaction;
  referenceMonth: string;
  monthName: string;
  onChanged: () => Promise<void>;
  onError: (message: string) => void;
}

type SaveStatus = 'idle' | 'saving' | 'saved';

export function ContributionCell({
  participant,
  transaction,
  referenceMonth,
  monthName,
  onChanged,
  onError,
}: ContributionCellProps) {
  const [value, setValue] = useState(transaction?.amount ?? '');
  const [status, setStatus] = useState<SaveStatus>('idle');
  const savedTimer = useRef<number | undefined>(undefined);
  const hasValue = value.trim().length > 0;

  useEffect(
    () => () => {
      window.clearTimeout(savedTimer.current);
    },
    [],
  );

  async function saveValue() {
    if (status === 'saving') {
      return;
    }

    const normalizedValue = value.trim().replace(',', '.');
    const previousValue = transaction?.amount ?? '';

    if (!normalizedValue && !transaction) {
      return;
    }

    if (
      normalizedValue &&
      Number(normalizedValue) === Number(previousValue)
    ) {
      return;
    }

    if (
      normalizedValue &&
      (!Number.isFinite(Number(normalizedValue)) ||
        Number(normalizedValue) <= 0)
    ) {
      onError('Digite um valor maior que zero.');
      setValue(previousValue);
      return;
    }

    try {
      setStatus('saving');
      onError('');

      if (!normalizedValue && transaction) {
        await removeAdminTransaction(transaction.id);
      } else if (transaction) {
        await updateAdminTransaction(transaction.id, {
          amount: normalizedValue,
        });
      } else {
        await createAdminTransaction({
          type: 'ENTRY',
          amount: normalizedValue,
          description: `Contribuição mensal - ${monthName}`,
          referenceMonth,
          participantId: participant.id,
        });
      }

      await onChanged();
      setStatus('saved');

      window.clearTimeout(savedTimer.current);
      savedTimer.current = window.setTimeout(() => {
        setStatus('idle');
      }, 1600);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Não foi possível salvar o valor.';

      onError(message);
      setValue(previousValue);
      setStatus('idle');
    }
  }

  const className = [
    'contribution-cell',
    hasValue ? 'has-value' : '',
    status,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <td className={className}>
      <span className="currency-prefix">R$</span>

      <input
        aria-label={`${participant.name}, ${monthName}`}
        disabled={status === 'saving'}
        inputMode="decimal"
        placeholder="+"
        value={value}
        onBlur={() => void saveValue()}
        onChange={(event) => setValue(event.target.value)}
        onFocus={(event) => event.currentTarget.select()}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.currentTarget.blur();
          }

          if (event.key === 'Escape') {
            setValue(transaction?.amount ?? '');
            event.currentTarget.blur();
          }
        }}
      />

      {status !== 'idle' && (
        <span
          aria-label={status === 'saving' ? 'Salvando' : 'Salvo'}
          className="cell-status"
          role="status"
        >
          {status === 'saving' ? '…' : '✓'}
        </span>
      )}
    </td>
  );
}
