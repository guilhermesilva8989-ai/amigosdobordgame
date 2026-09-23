import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { createManagedAdmin, listManagedAdmins, removeManagedAdmin } from '../services/admin-api';
import { getAuthSession } from '../services/auth-session';
import type { ManagedAdmin } from '../types/admin';
import './Admin.css';
import './AdminAccounts.css';

export function AdminAccountsPage() {
  const session = getAuthSession();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<ManagedAdmin[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { setAdmins(await listManagedAdmins()); }
    catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Não foi possível carregar os administradores.';
      setError(message);
      if (message.includes('Sessão')) navigate('/admin/login', { replace: true });
    } finally { setLoading(false); }
  }, [navigate]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (!session) return <Navigate to="/admin/login" replace />;

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError(null); setSuccess(null);
    try {
      const admin = await createManagedAdmin({ name: name.trim(), email: email.trim(), password });
      setAdmins((current) => [...current, admin]);
      setName(''); setEmail(''); setPassword('');
      setSuccess('Administrador criado com sucesso. Ele já pode entrar com o e-mail e a senha cadastrados.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível criar o administrador.');
    } finally { setSaving(false); }
  }

  async function handleRemove(admin: ManagedAdmin) {
    if (!window.confirm(`Remover o acesso de ${admin.name} (${admin.email})? A conta não poderá mais entrar. O histórico financeiro será preservado.`)) return;
    setRemovingId(admin.id); setError(null); setSuccess(null);
    try {
      await removeManagedAdmin(admin.id);
      setAdmins((current) => current.filter((item) => item.id !== admin.id));
      setSuccess('Acesso removido com sucesso.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível remover o acesso.');
    } finally { setRemovingId(null); }
  }

  return (
    <main className="admin-dashboard-page">
      <header className="admin-dashboard-header">
        <div className="admin-dashboard-brand"><span><ShieldCheck size={25} /></span>
          <div><strong>Administradores</strong><small>Controle de acesso ao painel</small></div>
        </div>
        <Link className="admin-header-back" to="/admin"><ArrowLeft size={17} /> Voltar</Link>
      </header>
      <section className="accounts-content">
        <div className="accounts-heading"><span>ACESSO</span><h1>Gerenciar administradores</h1>
          <p>Crie contas para quem pode alterar os dados do grupo. A senha deve ter pelo menos 12 caracteres.</p>
        </div>
        <form className="accounts-form" onSubmit={(event) => void handleCreate(event)}>
          <label>Nome<input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} minLength={2} maxLength={100} required /></label>
          <label>E-mail<input type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Senha inicial<input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={12} maxLength={128} required /></label>
          <button type="submit" disabled={saving}>{saving ? 'Criando...' : 'Criar administrador'}</button>
        </form>
        {error && <div className="admin-message error" role="alert">{error}</div>}
        {success && <div className="admin-message success" role="status">{success}</div>}
        <div className="accounts-list">
          <h2>Contas com acesso ({admins.length})</h2>
          {loading && <p>Carregando administradores...</p>}
          {!loading && admins.length === 0 && <p>Nenhum administrador encontrado.</p>}
          {admins.map((admin) => (
            <div className="accounts-row" key={admin.id}>
              <div><strong>{admin.name}{admin.id === session.admin.id ? ' (você)' : ''}</strong><small>{admin.email}</small></div>
              <button type="button" disabled={removingId !== null || admin.id === session.admin.id || admins.filter((item) => item.isActive).length <= 1}
                title={admin.id === session.admin.id ? 'Você não pode remover sua própria conta' : undefined}
                onClick={() => void handleRemove(admin)}>{removingId === admin.id ? 'Removendo...' : 'Remover acesso'}</button>
            </div>
          ))}
        </div>
        <p className="accounts-note">Contas removidas perdem o acesso imediatamente. Movimentações e registros feitos por elas permanecem no histórico.</p>
      </section>
    </main>
  );
}
