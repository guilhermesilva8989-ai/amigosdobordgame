import {
  CheckCircle2,
  Coins,
  Dice5,
  LockKeyhole,
  PiggyBank,
  ShieldCheck,
  Sparkles,
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

        <a className="admin-link" href="#administracao">
          <LockKeyhole size={16} />
          Área administrativa
        </a>
      </header>

      <main id="inicio">
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">
              <Sparkles size={16} />
              Fundo coletivo para nossas partidas
            </span>

            <h1>
              Diversão organizada,
              <span> contas transparentes.</span>
            </h1>

            <p>
              Acompanhe as contribuições, despesas e o saldo do
              grupo de forma simples e segura. Somente o
              administrador pode alterar os dados.
            </p>

            <div className="hero-badges">
              <span>
                <ShieldCheck size={17} />
                Consulta pública
              </span>

              <span>
                <CheckCircle2 size={17} />
                Dados atualizados
              </span>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />

            <div className="dice-card">
              <Dice5 size={58} />
              <span>Próxima partida</span>
              <strong>28 de setembro</strong>
            </div>
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
