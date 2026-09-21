import {
  ArrowDownRight,
  ArrowUpRight,
  ReceiptText,
  Users,
} from 'lucide-react';
import type { DashboardResponse } from '../types/dashboard';

interface DashboardPanelsProps {
  dashboard: DashboardResponse;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

export function DashboardPanels({
  dashboard,
}: DashboardPanelsProps) {
  const { participants, recentTransactions } = dashboard;

  const aliasesByCode = new Map(
    participants.map((participant) => [
      participant.publicCode,
      participant.alias,
    ]),
  );

  return (
    <section className="dashboard-grid">
      <article className="panel" id="movimentacoes">
        <div className="panel-heading">
          <div>
            <span className="section-label">Histórico</span>
            <h2>Movimentações recentes</h2>
          </div>
          <ReceiptText size={22} />
        </div>

        <div className="transaction-list">
          {recentTransactions.length === 0 && (
            <p className="empty-state">
              Nenhuma movimentação registrada.
            </p>
          )}

          {recentTransactions.map((transaction) => {
            const typeClass = transaction.type.toLowerCase();

            const alias = transaction.participantCode
              ? aliasesByCode.get(transaction.participantCode)
              : 'Fundo coletivo';

            return (
              <div className="transaction" key={transaction.id}>
                <span
                  className={`transaction-icon ${typeClass}`}
                >
                  {transaction.type === 'ENTRY' ? (
                    <ArrowUpRight size={19} />
                  ) : (
                    <ArrowDownRight size={19} />
                  )}
                </span>

                <div className="transaction-info">
                  <strong>{transaction.description}</strong>
                  <span>
                    {alias} · {formatDate(transaction.occurredAt)}
                  </span>
                </div>

                <strong className={typeClass}>
                  {transaction.type === 'ENTRY' ? '+' : '-'}
                  {formatCurrency(Number(transaction.amount))}
                </strong>
              </div>
            );
          })}
        </div>
      </article>

      <article className="panel" id="participantes">
        <div className="panel-heading">
          <div>
            <span className="section-label">Privacidade</span>
            <h2>Participantes</h2>
          </div>
          <Users size={22} />
        </div>

        <p className="privacy-note">
          Os nomes fantasia mudam automaticamente a cada hora para
          proteger a identidade dos participantes.
        </p>

        <div className="participant-list">
          {participants.length === 0 && (
            <p className="empty-state">
              Nenhum participante ativo.
            </p>
          )}

          {participants.map((participant) => (
            <div
              className="participant"
              key={participant.publicCode}
            >
              <span className="avatar">
                {participant.alias.charAt(0)}
              </span>

              <div>
                <strong>{participant.alias}</strong>
                <span>{participant.publicCode}</span>
              </div>

              <div className="participant-payment">
                <strong>
                  {formatCurrency(participant.paid)}
                </strong>
                <span
                  className={
                    participant.status === 'PAID'
                      ? 'status paid'
                      : 'status pending'
                  }
                >
                  {participant.status === 'PAID'
                    ? 'Em dia'
                    : 'Pendente'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
