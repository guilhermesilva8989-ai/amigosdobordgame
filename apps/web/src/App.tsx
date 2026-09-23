import {
  Coins,
  Dice5,
  LockKeyhole,
  PiggyBank,
  TrendingUp,
} from 'lucide-react';
import { DashboardContent } from './components/DashboardContent';
import { useDashboard } from './hooks/use-dashboard';
import './App.css';

function App() {
  const {
    dashboard,
    loading,
    error,
    refresh,
  } = useDashboard();

  const settings = dashboard?.settings;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="#inicio"
          aria-label="Página inicial"
        >
          <span className="brand-icon">
            <Dice5 size={25} />
          </span>

          <span>
            <strong>Amigos do Board Game</strong>
            <small>Transparência entre amigos</small>
          </span>
        </a>

        <nav
          className="navigation"
          aria-label="Navegação principal"
        >
          <a href="#resumo">Resumo</a>
          <a href="#movimentacoes">Movimentações</a>
          <a href="#participantes">Participantes</a>
        </nav>

        <a className="admin-link" href="/admin/login">
          <LockKeyhole size={16} />
          Área administrativa
        </a>
      </header>

      <main id="inicio">
        <section className="hero" aria-label="Apresentação do grupo">
          <div className="hero-visual">
            <img
              className="hero-backdrop"
              src={settings?.bannerUrl || '/banner.jpeg'}
              alt=""
              aria-hidden="true"
            />
            <img
              className="hero-poster"
              src={settings?.bannerUrl || '/banner.jpeg'}
              alt="Banner do grupo Amigos do Board Game"
            />
          </div>

          <div className="hero-content">
            <h1>
              {settings?.heroTitle ||
                'Diversão organizada, contas transparentes.'}
            </h1>
            <p>
              {settings?.heroDescription ||
                'Acompanhe as contribuições, despesas e o saldo do grupo de forma simples e segura.'}
            </p>
          </div>
        </section>

        <DashboardContent
          dashboard={dashboard}
          loading={loading}
          error={error}
          onRetry={() => void refresh()}
        />

        <section className="transparency-banner">
          <div>
            <span className="banner-icon">
              <PiggyBank size={28} />
            </span>

            <div>
              <h2>Transparência em primeiro lugar</h2>
              <p>
                Todas as entradas e saídas são registradas pelo
                administrador e ficam disponíveis para consulta.
              </p>
            </div>
          </div>

          <span className="updated">
            <TrendingUp size={17} />
            Atualizado automaticamente
          </span>
        </section>
      </main>

      <footer>
        <div className="footer-brand">
          <Coins size={20} />
          <span>Amigos do Board Game</span>
        </div>

        <p>
          Feito para organizar bons jogos e grandes amizades.
        </p>

        <span>© 2026</span>
      </footer>
    </div>
  );
}

export default App;
