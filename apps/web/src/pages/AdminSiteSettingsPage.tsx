import {
  ArrowLeft,
  Image,
  LoaderCircle,
  Save,
  Settings2,
  Users,
  WalletCards,
} from 'lucide-react';
import {
  type FormEvent,
  useEffect,
  useState,
} from 'react';
import {
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import {
  getAdminSiteSettings,
  saveAdminSiteSettings,
} from '../services/admin-api';
import {
  clearAuthSession,
  getAuthSession,
} from '../services/auth-session';
import type {
  NameDisplayMode,
  SaveSiteSettingsInput,
} from '../types/admin';
import './AdminSiteSettings.css';

const DEFAULT_BANNER = '/banner.jpeg';

export function AdminSiteSettingsPage() {
  const navigate = useNavigate();
  const session = getAuthSession();

  const [heroTitle, setHeroTitle] = useState('');
  const [heroDescription, setHeroDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState(DEFAULT_BANNER);
  const [showGoal, setShowGoal] = useState(true);
  const [nameDisplayMode, setNameDisplayMode] =
    useState<NameDisplayMode>('FANTASY');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!getAuthSession()) {
      return;
    }

    let cancelled = false;

    async function loadSettings() {
      try {
        const settings = await getAdminSiteSettings();

        if (cancelled) {
          return;
        }

        setHeroTitle(settings.heroTitle);
        setHeroDescription(settings.heroDescription);
        setBannerUrl(settings.bannerUrl);
        setShowGoal(settings.showGoal);
        setNameDisplayMode(settings.nameDisplayMode);
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar as configurações.';

        setErrorMessage(message);

        if (message.includes('Sessão')) {
          clearAuthSession();
          navigate('/admin/login', { replace: true });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedTitle = heroTitle.trim();
    const normalizedDescription = heroDescription.trim();
    const normalizedBannerUrl = bannerUrl.trim();

    if (
      !normalizedTitle ||
      !normalizedDescription ||
      !normalizedBannerUrl
    ) {
      setMessage('');
      setErrorMessage('Preencha todos os campos obrigatórios.');
      return;
    }

    const input: SaveSiteSettingsInput = {
      heroTitle: normalizedTitle,
      heroDescription: normalizedDescription,
      bannerUrl: normalizedBannerUrl,
      showGoal,
      nameDisplayMode,
    };

    try {
      setSaving(true);
      setMessage('');
      setErrorMessage('');

      const savedSettings =
        await saveAdminSiteSettings(input);

      setHeroTitle(savedSettings.heroTitle);
      setHeroDescription(savedSettings.heroDescription);
      setBannerUrl(savedSettings.bannerUrl);
      setShowGoal(savedSettings.showGoal);
      setNameDisplayMode(savedSettings.nameDisplayMode);
      setMessage('Configurações salvas com sucesso.');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar as configurações.';

      setErrorMessage(message);

      if (message.includes('Sessão')) {
        clearAuthSession();
        navigate('/admin/login', { replace: true });
      }
    } finally {
      setSaving(false);
    }
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <main className="admin-settings-page">
      <header className="admin-settings-header">
        <div className="admin-settings-brand">
          <span>
            <Settings2 size={24} />
          </span>

          <div>
            <strong>Configurações da página</strong>
            <small>Personalização do painel público</small>
          </div>
        </div>

        <Link to="/admin">
          <ArrowLeft size={17} />
          Voltar
        </Link>
      </header>

      <section className="admin-settings-content">
        <div className="admin-settings-heading">
          <span>APARÊNCIA E PRIVACIDADE</span>
          <h1>Personalize a página inicial</h1>
          <p>
            Altere o banner, os textos e as informações
            exibidas publicamente.
          </p>
        </div>

        {loading ? (
          <div className="admin-settings-loading">
            <LoaderCircle size={28} className="spin" />
            Carregando configurações...
          </div>
        ) : (
          <form
            className="admin-settings-form"
            onSubmit={handleSubmit}
          >
            {errorMessage && (
              <div className="admin-settings-message error">
                {errorMessage}
              </div>
            )}

            {message && (
              <div className="admin-settings-message success">
                {message}
              </div>
            )}

            <section className="admin-settings-card">
              <div className="admin-settings-card-title">
                <Image size={21} />
                <div>
                  <h2>Banner e apresentação</h2>
                  <p>
                    O banner ficará centralizado no início da página.
                  </p>
                </div>
              </div>

              <label>
                Endereço da imagem
                <input
                  type="text"
                  value={bannerUrl}
                  maxLength={1000}
                  onChange={(event) =>
                    setBannerUrl(event.target.value)
                  }
                  placeholder="/banner.jpeg"
                  required
                />
              </label>

              <div className="admin-banner-preview">
                <span>Pré-visualização</span>
                <img
                  src={bannerUrl || DEFAULT_BANNER}
                  alt="Pré-visualização do banner"
                  onError={(event) => {
                    event.currentTarget.src = DEFAULT_BANNER;
                  }}
                />
              </div>

              <label>
                Título abaixo do banner
                <input
                  type="text"
                  value={heroTitle}
                  maxLength={180}
                  onChange={(event) =>
                    setHeroTitle(event.target.value)
                  }
                  required
                />
              </label>

              <label>
                Texto de apresentação
                <textarea
                  value={heroDescription}
                  maxLength={500}
                  rows={4}
                  onChange={(event) =>
                    setHeroDescription(event.target.value)
                  }
                  required
                />
              </label>
            </section>

            <section className="admin-settings-card">
              <div className="admin-settings-card-title">
                <Users size={21} />
                <div>
                  <h2>Nomes dos participantes</h2>
                  <p>
                    Escolha como os nomes serão mostrados publicamente.
                  </p>
                </div>
              </div>

              <div className="admin-settings-options">
                <label
                  className={
                    nameDisplayMode === 'FANTASY'
                      ? 'selected'
                      : ''
                  }
                >
                  <input
                    type="radio"
                    name="nameDisplayMode"
                    value="FANTASY"
                    checked={nameDisplayMode === 'FANTASY'}
                    onChange={() =>
                      setNameDisplayMode('FANTASY')
                    }
                  />
                  <span>
                    <strong>Nomes fantasia</strong>
                    <small>
                      Apelidos mudam automaticamente para preservar
                      a privacidade.
                    </small>
                  </span>
                </label>

                <label
                  className={
                    nameDisplayMode === 'REAL'
                      ? 'selected'
                      : ''
                  }
                >
                  <input
                    type="radio"
                    name="nameDisplayMode"
                    value="REAL"
                    checked={nameDisplayMode === 'REAL'}
                    onChange={() =>
                      setNameDisplayMode('REAL')
                    }
                  />
                  <span>
                    <strong>Nomes reais</strong>
                    <small>
                      Os nomes cadastrados ficarão visíveis para
                      qualquer visitante.
                    </small>
                  </span>
                </label>
              </div>
            </section>

            <section className="admin-settings-card">
              <div className="admin-settings-card-title">
                <WalletCards size={21} />
                <div>
                  <h2>Meta financeira</h2>
                  <p>
                    Controle a exibição da meta no final da página.
                  </p>
                </div>
              </div>

              <label className="admin-settings-switch">
                <input
                  type="checkbox"
                  checked={showGoal}
                  onChange={(event) =>
                    setShowGoal(event.target.checked)
                  }
                />
                <span aria-hidden="true" />
                <div>
                  <strong>Exibir meta financeira</strong>
                  <small>
                    Quando desativada, a meta ficará oculta no
                    painel público.
                  </small>
                </div>
              </label>
            </section>

            <button
              className="admin-settings-save"
              type="submit"
              disabled={saving}
            >
              {saving ? (
                <LoaderCircle size={18} className="spin" />
              ) : (
                <Save size={18} />
              )}
              {saving ? 'Salvando...' : 'Salvar configurações'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
