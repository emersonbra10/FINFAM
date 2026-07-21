import React, { useState } from 'react';
import { FamilyMember } from '../types';
import { Button, Input, Select, Modal, Avatar, Spinner, Badge } from './ui';
import { AVATAR_PRESETS } from '../utils/constants';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

interface LoginScreenProps {
  members: FamilyMember[];
  onLogin: (member: FamilyMember) => void;
  onRegister: (newMember: Omit<FamilyMember, 'id' | 'currentSpending' | 'points' | 'limitStatus'> & { password?: string }) => void;
}

export default function LoginScreen({ members, onLogin, onRegister }: LoginScreenProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useSupabaseAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Aprendiz');
  const [regLimit, setRegLimit] = useState('1000');
  const [selectedAvatarIdx, setSelectedAvatarIdx] = useState(0);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Google Modal Simulation State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleStep, setGoogleStep] = useState<'select' | 'custom' | 'loading'>('select');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  // Handle Login (Supabase First, Fallback to local demo profiles)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    if (!loginEmail || !loginPassword) {
      setLoginError('Por favor, preencha todos os campos.');
      setIsSubmitting(false);
      return;
    }

    const normalizedEmail = loginEmail.toLowerCase().trim();

    try {
      // 1. Try Supabase Authentication
      const member = await signInWithEmail(normalizedEmail, loginPassword);
      if (member) {
        onLogin(member);
        setIsSubmitting(false);
        return;
      }
    } catch (err: any) {
      console.warn('Supabase Auth error, checking local demo accounts:', err.message);
    }

    // 2. Fallback to Local Demo Accounts if Supabase user is not found
    let found = members.find(m => m.email?.toLowerCase().trim() === normalizedEmail && m.password === loginPassword);

    if (!found) {
      if (normalizedEmail === 'ricardo@silva.com' && loginPassword === '123456') {
        found = members.find(m => m.id === 'ricardo');
      } else if (normalizedEmail === 'helena@silva.com' && loginPassword === '123456') {
        found = members.find(m => m.id === 'helena');
      }
    }

    if (found) {
      onLogin(found);
    } else {
      setLoginError('E-mail ou senha incorretos. (Dica Demo: ricardo@silva.com / 123456)');
    }
    setIsSubmitting(false);
  };

  // Handle Register (Supabase Signup + Local State Sync)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    setIsSubmitting(true);

    if (!regName || !regEmail || !regPassword || !regLimit) {
      setRegError('Por favor, preencha todos os campos obrigatórios.');
      setIsSubmitting(false);
      return;
    }

    const emailNormalized = regEmail.toLowerCase().trim();

    if (regPassword.length < 6) {
      setRegError('A senha deve ter pelo menos 6 caracteres.');
      setIsSubmitting(false);
      return;
    }

    const avatarUrl = AVATAR_PRESETS[selectedAvatarIdx];
    const parsedLimit = parseFloat(regLimit) || 1000;

    try {
      // 1. Register user on Supabase Auth & create public.profiles row
      const supabaseMember = await signUpWithEmail(emailNormalized, regPassword, {
        name: regName,
        role: regRole,
        spendingLimit: parsedLimit,
        avatarUrl,
      });

      // 2. Also register in local state for offline/demo compatibility
      onRegister({
        name: regName,
        email: emailNormalized,
        password: regPassword,
        role: regRole,
        spendingLimit: parsedLimit,
        avatarUrl,
      });

      if (supabaseMember) {
        setRegSuccess('Conta criada no Supabase com sucesso! Você já pode fazer login.');
      } else {
        setRegSuccess('Cadastro concluído! Faça login para acessar o painel.');
      }

      setLoginEmail(emailNormalized);
      setLoginPassword(regPassword);
      setTimeout(() => setActiveTab('login'), 1500);
    } catch (err: any) {
      console.error('Registration error:', err);
      // Fallback local register
      onRegister({
        name: regName,
        email: emailNormalized,
        password: regPassword,
        role: regRole,
        spendingLimit: parsedLimit,
        avatarUrl,
      });
      setRegSuccess('Cadastro realizado em modo local! Faça login.');
      setLoginEmail(emailNormalized);
      setLoginPassword(regPassword);
      setTimeout(() => setActiveTab('login'), 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger Supabase Real Google OAuth
  const handleRealGoogleOAuth = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      alert('Erro ao redirecionar para o Google OAuth: ' + err.message);
    }
  };

  // Start Google Quick Login Modal
  const handleGoogleClick = () => {
    setGoogleStep('select');
    setShowGoogleModal(true);
  };

  // Trigger Google Login complete with an account
  const selectGoogleAccount = (name: string, email: string, avatarUrl: string) => {
    setGoogleStep('loading');
    setTimeout(() => {
      const normalized = email.toLowerCase().trim();
      let member = members.find(m => m.email?.toLowerCase().trim() === normalized && m.isGoogleUser);

      if (!member) {
        const newId = 'g-' + Math.random().toString(36).substring(2, 9);
        const newMember: FamilyMember = {
          id: newId,
          name: name,
          role: 'Membro Google',
          spendingLimit: 2000,
          currentSpending: 0,
          points: 100,
          avatarUrl: avatarUrl,
          limitStatus: 'Dentro do limite',
          email: normalized,
          isGoogleUser: true
        };
        onLogin(newMember);
      } else {
        onLogin(member);
      }
      setShowGoogleModal(false);
    }, 1200);
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleName || !customGoogleEmail) return;
    const randomAvatar = AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)];
    selectGoogleAccount(customGoogleName, customGoogleEmail, randomAvatar);
  };

  const ErrorBanner = ({ message }: { message: string }) => (
    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center gap-2">
      <span className="material-symbols-outlined text-sm font-bold">error</span>
      <span>{message}</span>
    </div>
  );

  const SuccessBanner = ({ message }: { message: string }) => (
    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
      <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
      <span>{message}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] select-none pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[120px] select-none pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-slate-900/40 rounded-full blur-[160px] select-none pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in duration-500">
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-fuchsia-500 to-indigo-600 p-[1px] mb-3 shadow-xl shadow-indigo-500/15">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl font-bold bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-white bg-clip-text text-transparent animate-pulse">
                family_history
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-headline font-black text-white tracking-tight bg-gradient-to-r from-indigo-200 via-fuchsia-100 to-white bg-clip-text text-transparent">
            FinFam
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Sua família rica, unida e financeiramente saudável.</p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Supabase Auth Conectado (MCP)
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 shadow-2xl border border-white/10 space-y-6">
          
          <div className="flex border-b border-white/10 p-0.5">
            <button
              onClick={() => { setActiveTab('login'); setLoginError(''); setRegSuccess(''); }}
              className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setActiveTab('register'); setRegError(''); setRegSuccess(''); }}
              className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              Cadastrar Família
            </button>
          </div>

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && <ErrorBanner message={loginError} />}
              {regSuccess && <SuccessBanner message={regSuccess} />}

              <Input
                type="email"
                label="E-mail (Supabase ou Demo)"
                placeholder="ricardo@silva.com"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                required
              />

              <div className="space-y-1">
                <div className="flex justify-end mb-1">
                  <a href="#" onClick={(e) => { e.preventDefault(); alert("Dica Demo: Use a senha '123456' para as contas ricardo@silva.com ou helena@silva.com, ou faça login com sua conta cadastrada no Supabase."); }} className="text-[10px] text-indigo-400 hover:underline">Esqueceu?</a>
                </div>
                <Input
                  type="password"
                  label="Senha"
                  placeholder="••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={isSubmitting}
              >
                Acessar Painel
              </Button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">ou entrar com</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={handleGoogleClick}
                className="bg-white hover:bg-slate-100 text-slate-900 border-none flex items-center justify-center gap-2.5"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continuar com o Google
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
              {regError && <ErrorBanner message={regError} />}
              {regSuccess && <SuccessBanner message={regSuccess} />}

              <Input
                type="text"
                label="Nome Completo"
                placeholder="Ex: Carlos Silva"
                value={regName}
                onChange={e => setRegName(e.target.value)}
                required
              />

              <Input
                type="email"
                label="E-mail"
                placeholder="carlos@gmail.com"
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                required
              />

              <Input
                type="password"
                label="Criar Senha (mín. 6 chars)"
                placeholder="••••••"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Papel na Família"
                  value={regRole}
                  onChange={e => setRegRole(e.target.value)}
                  options={[
                    { value: "Líder do Grupo", label: "Líder do Grupo (Pai)" },
                    { value: "Estrategista", label: "Estrategista (Mãe)" },
                    { value: "Aprendiz", label: "Aprendiz (Filho/a)" },
                    { value: "Poupador", label: "Poupador(a)" },
                    { value: "Outro", label: "Outro" }
                  ]}
                />

                <Input
                  type="number"
                  label="Limite Mensal (R$)"
                  placeholder="1000"
                  value={regLimit}
                  onChange={e => setRegLimit(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selecione seu Avatar</label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatarIdx(idx)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        selectedAvatarIdx === idx 
                          ? 'border-indigo-500 scale-110 shadow-lg shadow-indigo-500/30' 
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      title={`Avatar ${idx + 1}`}
                    >
                      <Avatar src={url} alt={`Avatar ${idx + 1}`} size="lg" className="w-full h-full object-cover rounded-none" />
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={isSubmitting}
                className="mt-2"
              >
                Cadastrar no Supabase
              </Button>
            </form>
          )}

          <div className="text-center pt-1 border-t border-white/5">
            <p className="text-[10px] text-slate-500">
              Contas Demo: <strong className="text-indigo-400">ricardo@silva.com</strong> / <strong className="text-indigo-400">123456</strong>
            </p>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        title="Fazer login com o Google"
        showCloseButton={true}
        maxWidth="sm"
      >
        <div className="space-y-5">
          <div className="text-center -mt-2 mb-1">
            <p className="text-[10px] text-slate-400">para prosseguir para o <strong className="text-indigo-400">FinFam</strong> com Supabase Auth</p>
          </div>

          {googleStep === 'select' && (
            <div className="space-y-3">
              <Button
                type="button"
                variant="primary"
                fullWidth
                onClick={handleRealGoogleOAuth}
                icon="open_in_new"
                className="mb-2 bg-gradient-to-r from-indigo-600 to-fuchsia-600"
              >
                Redirecionar para Google OAuth Real
              </Button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-3 text-[9px] text-slate-500 font-bold uppercase tracking-widest">ou simulação rápida</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                <button
                  onClick={() => selectGoogleAccount('Emerson', 'emersonbra10@gmail.com', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80')}
                  className="w-full flex items-center gap-3 p-3 text-left rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                >
                  <Avatar src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80" alt="Emerson" size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">Emerson</p>
                    <p className="text-[10px] text-slate-400 truncate">emersonbra10@gmail.com</p>
                  </div>
                </button>

                <button
                  onClick={() => selectGoogleAccount('Ricardo Silva', 'ricardo.silva@gmail.com', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzPEF20PQazID4Kst6h_LDU9NM9FJmMDfYF0c1DkyhdW-V8BC1UDop9J3wyGRZz0deiUgQMEEq9Tcn-JsKk4t-fTBqxhgTJ_arLgHMjBLi9VyL5QkWCrrPmXp-PmrZSOePVsffsoWfW8UL9l2sHjCQo0_pgly8-2OeccMpdwsq7ykLbqSH9L8SpCeU6XNk88bPhUbBbey1qtjkLIwS8gfaRrNWtCXmFYpeTSeIxPkqafLOQ9wDy08AKmEqN12JnvhUx4-k_G4ioZJD')}
                  className="w-full flex items-center gap-3 p-3 text-left rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                >
                  <Avatar src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzPEF20PQazID4Kst6h_LDU9NM9FJmMDfYF0c1DkyhdW-V8BC1UDop9J3wyGRZz0deiUgQMEEq9Tcn-JsKk4t-fTBqxhgTJ_arLgHMjBLi9VyL5QkWCrrPmXp-PmrZSOePVsffsoWfW8UL9l2sHjCQo0_pgly8-2OeccMpdwsq7ykLbqSH9L8SpCeU6XNk88bPhUbBbey1qtjkLIwS8gfaRrNWtCXmFYpeTSeIxPkqafLOQ9wDy08AKmEqN12JnvhUx4-k_G4ioZJD" alt="Ricardo Silva" size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">Ricardo Silva</p>
                    <p className="text-[10px] text-slate-400 truncate">ricardo.silva@gmail.com</p>
                  </div>
                </button>

                <button
                  onClick={() => selectGoogleAccount('Helena Silva', 'helena.silva@gmail.com', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfHkA5y8aXHhusH59UHBX6QToFoVLWXVkTN3XOvDnUfsdcJcfWdkNZxxjdj7bsIHxKQJ27R1YUyAwG-kz4ORj4VK0gfTGYub5AcMof53iXnxzZC1nogQH-vUFnFRWaWCvK-24LAP9Fpz-8H4KZyZqPUXT0XWuS4kwWoHSVnLwwuU0OdlA_6RRKPBQy02kXJlsult5Zo7QxWvoDacazhS17Y8G-A2b8eSmB7QIjfzQaoKcazFRmju7nZ_7zRKuq_2hi10Y2093_rBFm')}
                  className="w-full flex items-center gap-3 p-3 text-left rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                >
                  <Avatar src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfHkA5y8aXHhusH59UHBX6QToFoVLWXVkTN3XOvDnUfsdcJcfWdkNZxxjdj7bsIHxKQJ27R1YUyAwG-kz4ORj4VK0gfTGYub5AcMof53iXnxzZC1nogQH-vUFnFRWaWCvK-24LAP9Fpz-8H4KZyZqPUXT0XWuS4kwWoHSVnLwwuU0OdlA_6RRKPBQy02kXJlsult5Zo7QxWvoDacazhS17Y8G-A2b8eSmB7QIjfzQaoKcazFRmju7nZ_7zRKuq_2hi10Y2093_rBFm" alt="Helena Silva" size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">Helena Silva</p>
                    <p className="text-[10px] text-slate-400 truncate">helena.silva@gmail.com</p>
                  </div>
                </button>
              </div>

              <Button
                variant="ghost"
                fullWidth
                onClick={() => setGoogleStep('custom')}
                className="mt-2 text-slate-300 border border-white/10 hover:border-white/20 bg-white/5"
              >
                Usar outra conta Google
              </Button>
            </div>
          )}

          {googleStep === 'custom' && (
            <form onSubmit={handleCustomGoogleSubmit} className="space-y-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Acessar com outra Conta Google</p>
              <Input
                type="text"
                label="Seu Nome"
                placeholder="Ex: Amanda Lima"
                value={customGoogleName}
                onChange={e => setCustomGoogleName(e.target.value)}
                required
              />
              <Input
                type="email"
                label="E-mail Google"
                placeholder="amanda@gmail.com"
                value={customGoogleEmail}
                onChange={e => setCustomGoogleEmail(e.target.value)}
                required
              />
              
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setGoogleStep('select')}
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                >
                  Confirmar Conta
                </Button>
              </div>
            </form>
          )}

          {googleStep === 'loading' && (
            <div className="text-center py-8 space-y-4">
              <Spinner size="lg" className="mx-auto" />
              <p className="text-xs text-slate-300 font-medium">Autenticando e integrando com o Supabase...</p>
              <p className="text-[10px] text-slate-500">Isso levará apenas um segundo.</p>
            </div>
          )}

          <div className="text-[10px] text-slate-500 leading-relaxed border-t border-white/5 pt-3">
            O Supabase Auth gerencia com segurança as credenciais, tokens JWT e sessões da família.
          </div>
        </div>
      </Modal>

    </div>
  );
}
