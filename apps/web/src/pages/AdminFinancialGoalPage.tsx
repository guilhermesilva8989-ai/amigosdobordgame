import {
  ArrowLeft,
  CalendarDays,
  LoaderCircle,
  Save,
  Target,
} from 'lucide-react';
import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import {
  getAdminFinancialGoal,
  saveAdminFinancialGoal,
} from '../services/admin-api';
import { getAuthSession } from '../services/auth-session';
import type { AdminFinancialGoal } from '../types/admin';
import './Admin.css';
import './AdminFinancialGoal.css';

function formatCurrency(value: string) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value));
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Sem prazo definido';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
  }).format(new Date(value));
}

export function AdminFinancialGoalPage() {
  const navigate = useNavigate();
  const session = getAuthSession();
  const [goal, setGoal] =
    useState<AdminFinancialGoal | null>(null);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSessionError = useCallback(
    (message: string) => {
      if (message.includes('Sessão')) {
        navigate('/admin/login', { replace: true });
        return true;
      }

      return false;
    },
    [navigate],
  );

  const loadGoal = useCallback(async () => {
    try {
      setError('');
      const response = await getAdminFinancialGoal();

      setGoal(response);

      if (response) {
        setTitle(response.title);
        setTargetAmount(response.targetAmount);
        setDeadline(response.deadline?.slice(0, 10) ?? '');
      }
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Não foi possível carregar a meta financeira.';

      if (!handleSessionError(message)) {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [handleSessionError]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadGoal();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadGoal]);

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!title.trim() || Number(targetAmount) <= 0) {
      setError('Informe o nome e um valor válido para a meta.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await saveAdminFinancialGoal({
        title: title.trim(),
        targetAmount,
        ...(deadline ? { deadline } : {}),
      });

      setGoal(response);
      setSuccess('Meta financeira salva com sucesso.');
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Não foi possível salvar a meta financeira.';

      if (!handleSessionError(message)) {
        setError(message);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="admin-goal-page">
      <header className="admin-inner-header">
        <div className="admin-inner-brand">
          <span>
            <Target size={24} />
          </span>
          <div>
            <strong>Meta financeira</strong>
            <small>Objetivo atual do fundo coletivo</small>
          </div>
        </div>

        <Link className="admin-back-button" to="/admin">
          <ArrowLeft size={17} />
          Voltar
        </Link>
      </header>

      <section className="admin-goal-content">
        <div className="admin-goal-heading">
          <span className="admin-eyebrow">Planejamento</span>
          <h1>Objetivo do grupo</h1>
          <p>
            Defina quanto o grupo deseja acumular e o prazo da meta.
          </p>
        </div>

        {loading ? (
          <div className="admin-loading">
            <LoaderCircle
              className="admin-spinner"
              size={25}
            />
            Carregando meta...
          </div>
        ) : (
          <div className="admin-goal-layout">
            <form
              className="admin-goal-form"
              onSubmit={handleSubmit}
            >
              <div>
                <label htmlFor="goal-title">Nome da meta</label>
                <input
                  id="goal-title"
                  maxLength={150}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Ex.: Comprar novos jogos"
                  required
                  type="text"
                  value={title}
                />
              </div>

              <div className="admin-goal-fields">
                <div>
                  <label htmlFor="goal-amount">
                    Valor desejado
                  </label>
                  <div className="admin-goal-money">
                    <span>R$</span>
                    <input
                      id="goal-amount"
                      min="0.01"
                      onChange={(event) =>
                        setTargetAmount(event.target.value)
                      }
                      placeholder="0,00"
                      required
                      step="0.01"
                      type="number"
                      value={targetAmount}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="goal-deadline">
                    Prazo opcional
                  </label>
                  <input
                    id="goal-deadline"
                    onChange={(event) =>
                      setDeadline(event.target.value)
                    }
                    type="date"
                    value={deadline}
                  />
                </div>
              </div>

              {error && (
                <div className="admin-feedback error" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="admin-feedback success" role="status">
                  {success}
                </div>
              )}

              <button
                className="admin-goal-submit"
                disabled={saving}
                type="submit"
              >
                {saving ? (
                  <LoaderCircle
                    className="admin-spinner"
                    size={18}
                  />
                ) : (
                  <Save size={18} />
                )}
                {saving ? 'Salvando...' : 'Salvar meta'}
              </button>
            </form>

            <aside className="admin-goal-preview">
              <div className="admin-goal-preview-icon">
                <Target size={30} />
              </div>
              <span>Meta atual</span>
              <h2>{goal?.title ?? 'Nenhuma meta definida'}</h2>
              <strong>
                {goal
                  ? formatCurrency(goal.targetAmount)
                  : 'R$ 0,00'}
              </strong>
              <div>
                <CalendarDays size={17} />
                {goal
                  ? formatDate(goal.deadline)
                  : 'Defina uma data opcional'}
              </div>
              <p>
                O progresso aparecerá automaticamente no painel
                público conforme o saldo do grupo aumentar.
              </p>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
