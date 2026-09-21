import {
  ArrowLeft,
  Dice5,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import {
  type FormEvent,
  useState,
} from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { loginAdmin } from '../services/auth-api';
import {
  getAuthSession,
  saveAuthSession,
} from '../services/auth-session';
import './Admin.css';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const existingSession = getAuthSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (existingSession) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const session = await loginAdmin({
        email: email.trim().toLowerCase(),
        password,
      });

      saveAuthSession(session);
      navigate('/admin', { replace: true });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Não foi possível realizar o login.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-auth-page">
      <section className="admin-auth-card">
        <div className="admin-auth-brand">
          <span>
            <Dice5 size={30} />
          </span>
          <div>
            <strong>Amigos do Board Game</strong>
            <small>Área administrativa</small>
          </div>
        </div>

        <div className="admin-auth-heading">
          <span className="admin-auth-icon">
            <LockKeyhole size={24} />
          </span>
          <h1>Acesso do administrador</h1>
          <p>
            Entre com suas credenciais para gerenciar os dados
            financeiros do grupo.
          </p>
        </div>

        <form className="admin-auth-form" onSubmit={handleSubmit}>
          <label htmlFor="admin-email">
            E-mail
            <span className="admin-input">
              <Mail size={18} />
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu-email@exemplo.com"
                required
              />
            </span>
          </label>

          <label htmlFor="admin-password">
            Senha
            <span className="admin-input">
              <LockKeyhole size={18} />
              <input
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite sua senha"
                minLength={12}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={
                  showPassword ? 'Ocultar senha' : 'Mostrar senha'
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </span>
          </label>

          {error && (
            <div className="admin-auth-error" role="alert">
              {error}
            </div>
          )}

          <button
            className="admin-submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Entrando...' : 'Entrar com segurança'}
          </button>
        </form>

        <div className="admin-auth-security">
          <ShieldCheck size={18} />
          <span>
            Acesso restrito. Todas as alterações são auditadas.
          </span>
        </div>

        <Link className="admin-back-link" to="/">
          <ArrowLeft size={17} />
          Voltar para o painel público
        </Link>
      </section>
    </main>
  );
}
