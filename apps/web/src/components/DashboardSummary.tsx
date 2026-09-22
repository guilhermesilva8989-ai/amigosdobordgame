import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Target,
  Users,
  WalletCards,
} from 'lucide-react';
import type { DashboardResponse } from '../types/dashboard';

interface DashboardSummaryProps {
  dashboard: DashboardResponse;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

const formatMonth = (value: string) => {
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export function DashboardSummary({
  dashboard,
}: DashboardSummaryProps) {
  const { summary, goal } = dashboard;
  const percentage = Math.min(100, Math.max(0, goal?.percentage ?? 0));

  return (
    <section className="content-section" id="resumo">
      <div className="section-heading">
        <div>
          <span className="section-label">Visão geral</span>
          <h2>Resumo financeiro</h2>
        </div>

        <span className="period">
          <CalendarDays size={17} />
          {formatMonth(dashboard.referenceMonth)}
        </span>
      </div>

      <div className="summary-grid">
        <article className="summary-card entry">
          <span className="card-icon">
            <ArrowUpRight />
          </span>
          <div>
            <span>Total de entradas</span>
            <strong>{formatCurrency(summary.totalEntries)}</strong>
            <small>Contribuições acumuladas</small>
          </div>
        </article>

        <article className="summary-card expense">
          <span className="card-icon">
            <ArrowDownRight />
          </span>
          <div>
            <span>Total de saídas</span>
            <strong>{formatCurrency(summary.totalExpenses)}</strong>
            <small>Despesas registradas</small>
          </div>
        </article>

        <article className="summary-card balance">
          <span className="card-icon">
            <WalletCards />
          </span>
          <div>
            <span>Saldo disponível</span>
            <strong>{formatCurrency(summary.balance)}</strong>
            <small>Entradas menos despesas</small>
          </div>
        </article>

        <article className="summary-card members">
          <span className="card-icon">
            <Users />
          </span>
          <div>
            <span>Participantes</span>
            <strong>{summary.activeParticipants} ativos</strong>
            <small>
              {summary.paidParticipants} contribuições em dia
            </small>
          </div>
        </article>
      </div>

      {goal && (
        <div className="goal-card">
          <div className="goal-icon">
            <Target size={28} />
          </div>

          <div className="goal-content">
            <div className="goal-title">
              <div>
                <span>Meta do fundo</span>
                <strong>{goal.title}</strong>
              </div>
              <strong>{percentage.toFixed(1)}%</strong>
            </div>

            <div
              className="progress-track"
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ width: `${percentage}%` }} />
            </div>

            <div className="goal-values">
              <span>
                {formatCurrency(goal.currentAmount)} arrecadados
              </span>
              <span>
                Meta: {formatCurrency(goal.targetAmount)}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
