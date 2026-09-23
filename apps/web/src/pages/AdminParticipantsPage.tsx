import {
  ArrowLeft,
  CheckCircle2,
  UserPlus,
  Users,
  XCircle,
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
  createAdminParticipant,
  listAdminParticipants,
  removeAdminParticipant,
  updateAdminParticipant,
} from '../services/admin-api';
import { getAuthSession } from '../services/auth-session';
import type { AdminParticipant } from '../types/admin';
import './Admin.css';
import './AdminParticipants.css';

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));

export function AdminParticipantsPage() {
  const navigate = useNavigate();
  const session = getAuthSession();

  const [participants, setParticipants] = useState<
    AdminParticipant[]
  >([]);

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadParticipants = useCallback(async () => {
    try {
      setError(null);
      const response = await listAdminParticipants();
      setParticipants(response);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Não foi possível carregar os participantes.';

      setError(message);

      if (message.includes('Sessão')) {
        navigate('/admin/login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void loadParticipants();
    }, 0);

    return () => window.clearTimeout(initialLoad);
  }, [loadParticipants]);

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  async function handleCreate(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const participant = await createAdminParticipant({
        name: name.trim(),
      });

      setParticipants((current) => [
        ...current,
        participant,
      ]);

      setName('');
      setSuccess('Participante cadastrado com sucesso.');
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Não foi possível cadastrar o participante.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(participant: AdminParticipant) {
    setUpdatingId(participant.id);
    setError(null);
    setSuccess(null);

    try {
      const updatedParticipant =
        await updateAdminParticipant(participant.id, {
          isActive: !participant.isActive,
        });

      setParticipants((current) =>
        current.map((item) =>
          item.id === updatedParticipant.id
            ? updatedParticipant
            : item,
        ),
      );

      setSuccess(
        updatedParticipant.isActive
          ? 'Participante ativado com sucesso.'
          : 'Participante desativado com sucesso.',
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Não foi possível atualizar o participante.',
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleRemove(participant: AdminParticipant) {
    if (
      !window.confirm(
        `Excluir definitivamente "${participant.name}"? Esta ação não pode ser desfeita.`,
      )
    ) {
      return;
    }

    setUpdatingId(participant.id);
    setError(null);
    setSuccess(null);

    try {
      await removeAdminParticipant(participant.id);
      setParticipants((current) =>
        current.filter((item) => item.id !== participant.id),
      );
      setSuccess('Participante excluído com sucesso.');
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Não foi possível excluir o participante.',
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="admin-dashboard-page">
      <header className="admin-dashboard-header">
        <div className="admin-dashboard-brand">
          <span>
            <Users size={25} />
          </span>
          <div>
            <strong>Gerenciar participantes</strong>
            <small>Dados privados do administrador</small>
          </div>
        </div>

        <Link className="admin-header-back" to="/admin">
          <ArrowLeft size={17} />
          Voltar
        </Link>
      </header>

      <section className="participants-admin-content">
        <div className="participants-admin-heading">
          <div>
            <span>Participantes</span>
            <h1>Cadastro e controle</h1>
            <p>
              Os nomes reais aparecem somente nesta área protegida.
            </p>
          </div>

          <strong>{participants.length} cadastrados</strong>
        </div>

        <form
          className="participant-create-form"
          onSubmit={handleCreate}
        >
          <span className="participant-form-icon">
            <UserPlus size={24} />
          </span>

          <label htmlFor="participant-name">
            Nome do participante
            <input
              id="participant-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Digite o nome completo"
              minLength={2}
              maxLength={120}
              required
            />
          </label>

          <button type="submit" disabled={saving}>
            {saving ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        {error && (
          <div className="admin-message error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-message success" role="status">
            {success}
          </div>
        )}

        <div className="participants-admin-list">
          <div className="participants-list-header">
            <span>Participante</span>
            <span>Código público</span>
            <span>Cadastro</span>
            <span>Status</span>
            <span>Ação</span>
          </div>

          {loading && (
            <p className="participants-loading">
              Carregando participantes...
            </p>
          )}

          {!loading && participants.length === 0 && (
            <p className="participants-loading">
              Nenhum participante cadastrado.
            </p>
          )}

          {participants.map((participant) => (
            <div
              className="participant-admin-row"
              key={participant.id}
            >
              <div className="participant-admin-name">
                <span>{participant.name.charAt(0)}</span>
                <strong>{participant.name}</strong>
              </div>

              <code>{participant.publicCode}</code>
              <span>{formatDate(participant.joinedAt)}</span>

              <span
                className={
                  participant.isActive
                    ? 'admin-status active'
                    : 'admin-status inactive'
                }
              >
                {participant.isActive ? (
                  <CheckCircle2 size={15} />
                ) : (
                  <XCircle size={15} />
                )}
                {participant.isActive ? 'Ativo' : 'Inativo'}
              </span>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="participant-toggle"
                  disabled={updatingId === participant.id}
                  onClick={() => void handleToggle(participant)}
                >
                  {updatingId === participant.id
                    ? 'Salvando...'
                    : participant.isActive
                      ? 'Desativar'
                      : 'Ativar'}
                </button>
                <button
                  type="button"
                  className="participant-toggle"
                  style={{ background: '#fff', color: '#b53220', border: '1px solid #b53220' }}
                  disabled={updatingId === participant.id}
                  onClick={() => void handleRemove(participant)}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
