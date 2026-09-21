import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Coins,
  Dice5,
  LockKeyhole,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  WalletCards,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import './App.css';

const fantasyNames = [
  'Luke Skywalker',
  'Leia Organa',
  'Han Solo',
  'Ahsoka Tano',
  'Obi-Wan Kenobi',
  'Din Djarin',
  'Monkey D. Luffy',
  'Roronoa Zoro',
  'Nami',
  'Sanji',
  'Nico Robin',
  'Trafalgar Law',
];

const participants = [
  { id: 'JOG-001', paid: 200, status: 'Em dia' },
  { id: 'JOG-002', paid: 200, status: 'Em dia' },
  { id: 'JOG-003', paid: 180, status: 'Em dia' },
  { id: 'JOG-004', paid: 200, status: 'Em dia' },
  { id: 'JOG-005', paid: 160, status: 'Pendente' },
  { id: 'JOG-006', paid: 200, status: 'Em dia' },
];

const transactions = [
  {
    description: 'Contribuição mensal',
    aliasIndex: 0,
    date: '18 set. 2026',
    value: 200,
    type: 'entry',
  },
  {
    description: 'Compra de jogos',
    aliasIndex: 4,
    date: '15 set. 2026',
    value: 320,
    type: 'expense',
  },
  {
    description: 'Contribuição mensal',
    aliasIndex: 7,
    date: '12 set. 2026',
    value: 180,
    type: 'entry',
  },
  {
    description: 'Materiais para o encontro',
    aliasIndex: 10,
    date: '08 set. 2026',
    value: 184,
    type: 'expense',
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

function App() {
  const [hourReference, setHourReference] = useState(() =>
    Math.floor(Date.now() / 3_600_000),
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHourReference(Math.floor(Date.now() / 3_600_000));
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  const aliases = useMemo(
    () =>
      participants.map(
        (_, index) =>
          fantasyNames[(index + hourReference) % fantasyNames.length],
      ),
    [hourReference],
  );

  const transactionAliases = useMemo(
    () =>
      transactions.map(
        (transaction) =>
          fantasyNames[
            (transaction.aliasIndex + hourReference) % fantasyNames.length
          ],
      ),
    [hourReference],
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Página inicial">
          <span className="brand-icon">
            <Dice5 size={25} />
          </span>

          <span>
            <strong>Amigos do Board Game</strong>
            <small>Transparência entre amigos</small>
          </span>
        </a>

        <nav className="navigation" aria-label="Navegação principal">
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
              Acompanhe as contribuições, despesas e o saldo do grupo de forma
              simples e segura. Somente o administrador pode alterar os dados.
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

        <section className="content-section" id="resumo">
          <div className="section-heading">
            <div>
              <span className="section-label">Visão geral</span>
              <h2>Resumo financeiro</h2>
            </div>

            <span className="period">
              <CalendarDays size={17} />
              Setembro de 2026
            </span>
          </div>

          <div className="summary-grid">
            <article className="summary-card entry">
              <span className="card-icon">
                <ArrowUpRight />
              </span>
              <div>
                <span>Total de entradas</span>
                <strong>{formatCurrency(2020)}</strong>
                <small>Contribuições acumuladas</small>
              </div>
            </article>

            <article className="summary-card expense">
              <span className="card-icon">
                <ArrowDownRight />
              </span>
              <div>
                <span>Total de saídas</span>
                <strong>{formatCurrency(504)}</strong>
                <small>Despesas registradas</small>
              </div>
            </article>

            <article className="summary-card balance">
              <span className="card-icon">
                <WalletCards />
              </span>
              <div>
                <span>Saldo disponível</span>
                <strong>{formatCurrency(1516)}</strong>
                <small>Entradas menos despesas</small>
              </div>
            </article>

            <article className="summary-card members">
              <span className="card-icon">
                <Users />
              </span>
              <div>
                <span>Participantes</span>
                <strong>6 ativos</strong>
                <small>5 contribuições em dia</small>
              </div>
            </article>
          </div>

          <div className="goal-card">
            <div className="goal-icon">
              <Target size={28} />
            </div>

            <div className="goal-content">
              <div className="goal-title">
                <div>
                  <span>Meta do fundo</span>
                  <strong>Novos jogos para o grupo</strong>
                </div>
                <strong>50,5%</strong>
              </div>

              <div
                className="progress-track"
                role="progressbar"
                aria-valuenow={50.5}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span />
              </div>

              <div className="goal-values">
                <span>{formatCurrency(1516)} arrecadados</span>
                <span>Meta: {formatCurrency(3000)}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-grid">
          <article className="panel" id="movimentacoes">
            <div className="panel-heading">
              <div>
                <span className="section-label">Histórico</span>
                <h2>Movimentações recentes</h2>
              </div>
              <ReceiptText size={22} />
            </div>

            <div className="transaction-list">
              {transactions.map((transaction, index) => (
                <div
                  className="transaction"
                  key={`${transaction.description}-${transaction.date}`}
                >
                  <span className={`transaction-icon ${transaction.type}`}>
                    {transaction.type === 'entry' ? (
                      <ArrowUpRight size={19} />
                    ) : (
                      <ArrowDownRight size={19} />
                    )}
                  </span>

                  <div className="transaction-info">
                    <strong>{transaction.description}</strong>
                    <span>
                      {transactionAliases[index]} · {transaction.date}
                    </span>
                  </div>

                  <strong className={transaction.type}>
                    {transaction.type === 'entry' ? '+' : '-'}
                    {formatCurrency(transaction.value)}
                  </strong>
                </div>
              ))}
            </div>
          </article>

          <article className="panel" id="participantes">
            <div className="panel-heading">
              <div>
                <span className="section-label">Privacidade</span>
                <h2>Participantes</h2>
              </div>
              <Users size={22} />
            </div>

            <p className="privacy-note">
              Os nomes fantasia mudam automaticamente a cada hora para proteger
              a identidade dos participantes.
            </p>

            <div className="participant-list">
              {participants.map((participant, index) => (
                <div className="participant" key={participant.id}>
                  <span className="avatar">{aliases[index].charAt(0)}</span>

                  <div>
                    <strong>{aliases[index]}</strong>
                    <span>{participant.id}</span>
                  </div>

                  <div className="participant-payment">
                    <strong>{formatCurrency(participant.paid)}</strong>
                    <span
                      className={
                        participant.status === 'Em dia'
                          ? 'status paid'
                          : 'status pending'
                      }
                    >
                      {participant.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="transparency-banner">
          <div>
            <span className="banner-icon">
              <PiggyBank size={28} />
            </span>
            <div>
              <h2>Transparência em primeiro lugar</h2>
              <p>
                Todas as entradas e saídas são registradas pelo administrador e
                ficam disponíveis para consulta.
              </p>
            </div>
          </div>

          <span className="updated">
            <TrendingUp size={17} />
            Atualizado recentemente
          </span>
        </section>
      </main>

      <footer>
        <div className="footer-brand">
          <Coins size={20} />
          <span>Amigos do Board Game</span>
        </div>
        <p>Feito para organizar bons jogos e grandes amizades.</p>
        <span>© 2026</span>
      </footer>
    </div>
  );
}

export default App;
