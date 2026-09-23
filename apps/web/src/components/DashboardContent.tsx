import type { DashboardResponse } from '../types/dashboard';
import { DashboardGoal } from './DashboardGoal';
import { DashboardPanels } from './DashboardPanels';
import { DashboardSummary } from './DashboardSummary';

interface DashboardContentProps {
  dashboard: DashboardResponse | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function DashboardContent({
  dashboard,
  loading,
  error,
  onRetry,
}: DashboardContentProps) {
  if (loading && !dashboard) {
    return (
      <section className="dashboard-state" aria-live="polite">
        <span className="loading-spinner" />
        <h2>Carregando painel financeiro</h2>
        <p>Aguarde enquanto buscamos os dados mais recentes.</p>
      </section>
    );
  }

  if (error && !dashboard) {
    return (
      <section
        className="dashboard-state error-state"
        role="alert"
      >
        <h2>Não foi possível carregar o painel</h2>
        <p>{error}</p>
        <button type="button" onClick={onRetry}>
          Tentar novamente
        </button>
      </section>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <>
      {error && (
        <div className="refresh-warning" role="status">
          <span>
            Não foi possível atualizar. Exibindo os últimos dados.
          </span>
          <button type="button" onClick={onRetry}>
            Atualizar
          </button>
        </div>
      )}

      <DashboardSummary dashboard={dashboard} />
      <DashboardPanels dashboard={dashboard} />
      {dashboard.settings.showGoal && (
        <DashboardGoal goal={dashboard.goal} />
      )}
    </>
  );
}
