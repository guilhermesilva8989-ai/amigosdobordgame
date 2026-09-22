import './ContributionGrid.css';
import { useMemo } from 'react';
import type {
  AdminParticipant,
  AdminTransaction,
} from '../../types/admin';
import { ContributionCell } from './ContributionCell';

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

interface ContributionGridProps {
  participants: AdminParticipant[];
  transactions: AdminTransaction[];
  year: number;
  onChanged: () => Promise<void>;
  onError: (message: string) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

export function ContributionGrid({
  participants,
  transactions,
  year,
  onChanged,
  onError,
}: ContributionGridProps) {
  const entries = useMemo(
    () =>
      transactions.filter(
        (transaction) =>
          transaction.type === 'ENTRY' &&
          transaction.participantId &&
          transaction.referenceMonth?.startsWith(String(year)),
      ),
    [transactions, year],
  );

  const transactionMap = useMemo(() => {
    const map = new Map<string, AdminTransaction>();

    entries.forEach((transaction) => {
      const month = transaction.referenceMonth?.slice(0, 7);

      if (month && transaction.participantId) {
        map.set(`${transaction.participantId}:${month}`, transaction);
      }
    });

    return map;
  }, [entries]);

  const totalsByParticipant = useMemo(() => {
    const totals = new Map<string, number>();

    entries.forEach((transaction) => {
      if (!transaction.participantId) {
        return;
      }

      const current = totals.get(transaction.participantId) ?? 0;

      totals.set(
        transaction.participantId,
        current + Number(transaction.amount),
      );
    });

    return totals;
  }, [entries]);

  const totalReceived = entries.reduce(
    (total, transaction) => total + Number(transaction.amount),
    0,
  );

  if (participants.length === 0) {
    return (
      <div className="contribution-empty">
        Nenhum participante ativo. Cadastre ou ative um participante primeiro.
      </div>
    );
  }

  return (
    <>
      <p className="grid-help">
        Clique no <strong>+</strong> para adicionar. Altere o valor ou apague
        para remover. O salvamento é automático.
      </p>

      <div className="contribution-table-wrapper">
        <table className="contribution-table">
          <thead>
            <tr>
              <th className="participant-column">Participante</th>

              {MONTHS.map((month) => (
                <th key={month}>{month.slice(0, 3)}</th>
              ))}

              <th className="total-column">Total</th>
            </tr>
          </thead>

          <tbody>
            {participants.map((participant) => (
              <tr key={participant.id}>
                <th className="participant-name">
                  <strong>{participant.name}</strong>
                  <small>{participant.publicCode}</small>
                </th>

                {MONTHS.map((month, index) => {
                  const monthNumber = String(index + 1).padStart(2, '0');
                  const referenceMonth = `${year}-${monthNumber}`;
                  const transaction = transactionMap.get(
                    `${participant.id}:${referenceMonth}`,
                  );

                  return (
                    <ContributionCell
                      key={`${participant.id}:${referenceMonth}`}
                      monthName={month}
                      onChanged={onChanged}
                      onError={onError}
                      participant={participant}
                      referenceMonth={referenceMonth}
                      transaction={transaction}
                    />
                  );
                })}

                <td className="participant-total">
                  {formatCurrency(
                    totalsByParticipant.get(participant.id) ?? 0,
                  )}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr>
              <th colSpan={13}>Total recebido em {year}</th>
              <td>{formatCurrency(totalReceived)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}
