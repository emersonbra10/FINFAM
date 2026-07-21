import React, { useState } from 'react';
import { CreditCard, FamilyMember } from '../types';
import { Button, Input, Select, Card, ProgressBar, Switch } from './ui';
import { CARD_COLOR_CLASSES, CARD_BRANDS, CARD_COLORS } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

interface SettingsTabProps {
  cards: CreditCard[];
  onAddCard: (card: Omit<CreditCard, 'id'>) => void;
  onDeleteCard: (id: string) => void;
  members: FamilyMember[];
}

export default function SettingsTab({
  cards,
  onAddCard,
  onDeleteCard,
  members
}: SettingsTabProps) {
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  
  // Form States
  const [cardName, setCardName] = useState('');
  const [limit, setLimit] = useState('');
  const [usedLimit, setUsedLimit] = useState('');
  const [closingDay, setClosingDay] = useState(5);
  const [dueDay, setDueDay] = useState(10);
  const [brand, setBrand] = useState<'Visa' | 'Mastercard' | 'Elo' | 'Amex' | 'Outros'>('Mastercard');
  const [color, setColor] = useState<'purple' | 'orange' | 'blue' | 'emerald' | 'rose' | 'dark'>('purple');

  // App Toggles States (saved in localStorage for visual fidelity)
  const [whatsappAlerts, setWhatsappAlerts] = useState(() => {
    return localStorage.getItem('finfam_pref_whatsapp') === 'true';
  });
  const [smsRead, setSmsRead] = useState(() => {
    return localStorage.getItem('finfam_pref_sms') !== 'false'; // default true
  });
  const [openFinance, setOpenFinance] = useState(() => {
    return localStorage.getItem('finfam_pref_openfinance') !== 'false'; // default true
  });
  const [aiSavings, setAiSavings] = useState(() => {
    return localStorage.getItem('finfam_pref_aisavings') !== 'false'; // default true
  });

  const handleToggle = (key: string, currentValue: boolean, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    const nextValue = !currentValue;
    setter(nextValue);
    localStorage.setItem(key, String(nextValue));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName || !limit) return;

    onAddCard({
      name: cardName,
      limit: parseFloat(limit) || 0,
      usedLimit: parseFloat(usedLimit) || 0,
      closingDay: Number(closingDay),
      dueDay: Number(dueDay),
      brand,
      color
    });

    // Reset Form
    setCardName('');
    setLimit('');
    setUsedLimit('');
    setClosingDay(5);
    setDueDay(10);
    setBrand('Mastercard');
    setColor('purple');
    setShowAddCardForm(false);
  };

  // Brand Icon Helper
  const getBrandLogo = (cardBrand: string) => {
    switch (cardBrand) {
      case 'Visa': return '💳 Visa';
      case 'Mastercard': return '💳 Mastercard';
      case 'Elo': return '💳 Elo';
      case 'Amex': return '💳 Amex';
      default: return '💳 Card';
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-headline font-extrabold text-white">Configurações & Cartões</h1>
        <p className="text-xs text-slate-400 font-medium">Cadastre cartões de crédito e configure preferências do aplicativo da família.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Credit Card Display & Registration (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card Showcase Section */}
          <Card padding="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-base font-headline font-bold text-white">Cartões de Crédito da Família</h2>
                <p className="text-xs text-slate-400">Cartões sincronizados para controle de limite automático.</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon="add"
                onClick={() => setShowAddCardForm(!showAddCardForm)}
              >
                Novo Cartão
              </Button>
            </div>

            {/* Collapsible Register Card Form */}
            {showAddCardForm && (
              <form onSubmit={handleSubmit} className="mb-6 p-5 border border-white/10 bg-white/5 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-300">Cadastrar Cartão de Crédito</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Apelido do Cartão"
                    type="text"
                    placeholder="Ex: Nubank Ricardo"
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    required
                  />
                  <Select
                    label="Bandeira"
                    value={brand}
                    onChange={e => setBrand(e.target.value as any)}
                    options={CARD_BRANDS}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Limite Total (R$)"
                    type="number"
                    placeholder="Ex: 5000"
                    value={limit}
                    onChange={e => setLimit(e.target.value)}
                    required
                    className="font-mono"
                  />
                  <Input
                    label="Limite Já Utilizado (R$)"
                    type="number"
                    placeholder="Ex: 1200 (Opcional)"
                    value={usedLimit}
                    onChange={e => setUsedLimit(e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="Dia Fechamento"
                    type="number"
                    min="1"
                    max="31"
                    value={closingDay}
                    onChange={e => setClosingDay(Number(e.target.value))}
                    required
                    className="font-mono"
                  />
                  <Input
                    label="Dia Vencimento"
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={e => setDueDay(Number(e.target.value))}
                    required
                    className="font-mono"
                  />
                  <Select
                    label="Cor Visual"
                    value={color}
                    onChange={e => setColor(e.target.value as any)}
                    options={CARD_COLORS}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setShowAddCardForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                  >
                    Salvar Cartão
                  </Button>
                </div>
              </form>
            )}

            {/* List of Credit Cards */}
            {cards.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-white/10 rounded-2xl">
                <span className="material-symbols-outlined text-4xl text-slate-600 animate-pulse">credit_card</span>
                <p className="text-sm font-medium text-slate-400 mt-2">Nenhum cartão cadastrado.</p>
                <p className="text-xs text-slate-500 mt-1">Adicione os cartões de crédito da família para acompanhar limites e faturas.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {cards.map((card) => {
                  const percentUsed = Math.min(Math.round((card.usedLimit / card.limit) * 100), 100);
                  const availableLimit = card.limit - card.usedLimit;
                  const colorConfig = CARD_COLOR_CLASSES[card.color] || CARD_COLOR_CLASSES.purple;

                  return (
                    <div 
                      key={card.id}
                      className={`relative overflow-hidden rounded-2xl border p-5 flex flex-col justify-between h-48 hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 shadow-xl border-white/10 text-white bg-gradient-to-br ${colorConfig.gradient} ${colorConfig.accent}`}
                    >
                      {/* Gloss Overlay */}
                      <div className="absolute -right-16 -top-16 w-36 h-36 bg-white/10 rounded-full blur-2xl select-none pointer-events-none" />
                      
                      {/* Top Row: Name and brand */}
                      <div className="relative z-10 flex justify-between items-start">
                        <div>
                          <p className="text-xs font-headline font-bold text-white/70 uppercase tracking-widest">FinFam Platinum</p>
                          <h3 className="text-lg font-extrabold text-white font-headline mt-0.5 tracking-tight">{card.name}</h3>
                        </div>
                        <span className="font-mono text-xs font-bold bg-white/15 px-2.5 py-0.5 rounded-full border border-white/10">
                          {getBrandLogo(card.brand)}
                        </span>
                      </div>

                      {/* Middle Area: Chip and Limit details */}
                      <div className="relative z-10 flex justify-between items-end mt-4">
                        {/* Interactive chip mockup */}
                        <div className="w-9 h-7 rounded bg-amber-400/80 border border-amber-300/40 relative flex items-center justify-center overflow-hidden">
                          <div className="absolute inset-y-0 left-1/3 w-0.5 bg-slate-950/20" />
                          <div className="absolute inset-y-0 right-1/3 w-0.5 bg-slate-950/20" />
                          <div className="absolute inset-x-0 top-1/2 h-0.5 bg-slate-950/20" />
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] uppercase font-bold tracking-wider opacity-60">Limite Disponível</p>
                          <p className="font-mono text-base font-extrabold text-white">
                            {formatCurrency(availableLimit)}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Area: Progress Bar, Closing info & Trash */}
                      <div className="relative z-10 space-y-1.5 pt-3 border-t border-white/10 mt-auto">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span>
                            Fatura: Fecha Dia {card.closingDay}
                          </span>
                          <span className="font-mono">{percentUsed}% usado</span>
                        </div>
                        
                        <ProgressBar value={percentUsed} height="h-1.5" gradient="bg-white" />

                        <div className="flex justify-between items-center text-[10px] font-medium text-white/80 pt-1">
                          <span>Limite: {formatCurrency(card.limit)}</span>
                          <button
                            onClick={() => {
                              if (confirm(`Remover o cartão "${card.name}"?`)) {
                                onDeleteCard(card.id);
                              }
                            }}
                            className="text-white/40 hover:text-white transition-colors flex items-center gap-0.5 cursor-pointer"
                            title="Excluir Cartão"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Preferences, Sync & Notifications (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          <Card padding="p-5" interactive className="space-y-5">
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-sm font-headline font-bold text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-indigo-400">tune</span>
                Opções e Integrações
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Ative conexões em tempo real por SMS e Inteligência Artificial.</p>
            </div>

            {/* Sync Status Badge */}
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined text-indigo-400 animate-pulse">cloud_sync</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-indigo-200">Sincronização Ativa</p>
                <p className="text-[10px] text-indigo-300/80">Monitorando 4 celulares e 2 contas bancárias via Open Finance.</p>
              </div>
            </div>

            {/* Toggle list */}
            <div className="space-y-4">
              <Switch
                checked={whatsappAlerts}
                onChange={() => handleToggle('finfam_pref_whatsapp', whatsappAlerts, setWhatsappAlerts)}
                label="Alertas de Fraude no WhatsApp"
                description="Notifica os administradores se um membro estiver prestes a estourar o limite."
              />

              <Switch
                checked={smsRead}
                onChange={() => handleToggle('finfam_pref_sms', smsRead, setSmsRead)}
                label="Leitura Automática de SMS"
                description="Captura transações via SMS e push notifications do celular de Helena e Ricardo."
              />

              <Switch
                checked={openFinance}
                onChange={() => handleToggle('finfam_pref_openfinance', openFinance, setOpenFinance)}
                label="Integração Open Finance"
                description="Conexão criptografada ponta-a-ponta com os maiores bancos nacionais."
              />

              <Switch
                checked={aiSavings}
                onChange={() => handleToggle('finfam_pref_aisavings', aiSavings, setAiSavings)}
                label="Conselhos proativos da IA"
                description="Permite que o assistente analise metas e recomende cortes inteligentes automáticos."
              />
            </div>

            <div className="pt-4 border-t border-white/10 text-center">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => alert("Todas as configurações sincronizadas em nuvem com a Família Silva.")}
              >
                Sincronizar Agora
              </Button>
            </div>
          </Card>

          {/* Simulated Info Card */}
          <div className="bg-gradient-to-br from-indigo-500/10 via-fuchsia-500/5 to-transparent border border-white/10 rounded-2xl p-5 text-white space-y-3">
            <span className="material-symbols-outlined text-indigo-400 text-3xl font-bold animate-pulse">lock</span>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">Segurança de Dados</h3>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Os dados e limites da sua família estão protegidos com criptografia de ponta-a-ponta (AES-256) e conformidade integral com a LGPD.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
