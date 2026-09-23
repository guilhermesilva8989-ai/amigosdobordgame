import { Target } from 'lucide-react';
import type { DashboardGoal as Goal } from '../types/dashboard';

interface DashboardGoalProps {
  goal: Goal | null;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

export function DashboardGoal({ goal }: DashboardGoalProps) {
  if (!goal) {
    return null;
  }

  const percentage = Math.min(
    100,
    Math.max(0, goal.percentage),
  );

  return (
    <section className="content-section goal-section" id="meta">
      <div className="section-heading">
        <div>
          <span className="section-label">Objetivo do grupo</span>
          <h2>Meta do fundo</h2>
        </div>
      </div>

      <div className="goal-card">
        <div className="goal-icon">
          <Target size={28} />
        </div>

        <div className="goal-content">
          <div className="goal-title">
            <div>
              <span>Meta atual</span>
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
    </section>
  );
}
