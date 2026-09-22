import {
  ArrowDownRight,
  ArrowLeft,
  Dice5,
  LogOut,
  ReceiptText,
  Users,
  WalletCards,
} from 'lucide-react';
import {
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import {
  clearAuthSession,
  getAuthSession,
} from '../services/auth-session';
import './Admin.css';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const session = getAuthSession();

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  function handleLogout() {
    clearAuthSession();
    navigate('/admin/login', { replace: true });
  }

  return (
    <main className="admin-dashboard-page">
      <header className="admin-dashboard-header">
        <div className="admin-dashboard-brand">
          <span>
            <Dice5 size={25} />
          </span>
          <div>
            <strong>Amigos do Board Game</strong>
            <small>Painel administrativo</small>
          </div>
        </div>

        <div className="admin-dashboard-user">
          <div>
            <strong>{session.admin.name}</strong>
            <small>{session.admin.email}</small>
          </div>

          <button type="button" onClick={handleLogout}>
            <LogOut size={17} />
            Sair
          </button>
        </div>
      </header>

      <section className="admin-dashboard-content">
        <div className="admin-dashboard-heading">
          <div>
            <span>Administração</span>
            <h1>Gerencie o fundo do grupo</h1>
            <p>
              Cadastre participantes, contribuições, despesas e metas.
            </p>
          </div>

          <Link to="/">
            <ArrowLeft size={17} />
            Painel público
          </Link>
        </div>

        <div className="admin-action-grid">
          <article>
            <Users size={25} />
            <h2>Participantes</h2>
            <p>Cadastre, consulte e desative participantes.</p>
            <Link
              className="admin-action-button"
              to="/admin/participants"
            >
              Gerenciar participantes
            </Link>
          </article>

          <article>
            <ReceiptText size={25} />
            <h2>Contribuições</h2>
            <p>Controle os pagamentos mensais do grupo.</p>
            <Link
              className="admin-action-button"
              to="/admin/transactions"
            >
              Gerenciar contribuições
            </Link>
          </article>

          <article>
            <ArrowDownRight size={25} />
            <h2>Despesas</h2>
            <p>Registre compras e outros gastos do grupo.</p>
            <Link
              className="admin-action-button"
              to="/admin/expenses"
            >
              Gerenciar despesas
            </Link>
          </article>

          <article>
            <WalletCards size={25} />
            <h2>Meta financeira</h2>
            <p>Defina o objetivo atual do fundo coletivo.</p>
            <Link
              className="admin-action-button"
              to="/admin/financial-goal"
            >
              Configurar meta
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}
