import React, { useState, useEffect } from 'react';
import { FamilyMember, SavingsGoal, Achievement } from '../types';
import { Button, Input, Select, Card, ProgressBar, Badge, Modal, Avatar } from './ui';
import { ACHIEVEMENT_COLORS, GOAL_IMAGE_PRESETS } from '../utils/constants';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface FamilyTabProps {
  members: FamilyMember[];
  savingsGoal: SavingsGoal;
  achievements: Achievement[];
  onUpdateMemberLimit: (id: string, newLimit: number) => void;
  onAddContribution: (amount: number, memberId: string) => void;
}

const ACHIEVEMENT_ICONS = [
  { name: 'Troféu', value: 'emoji_events' },
  { name: 'Porquinho', value: 'savings' },
  { name: 'Ecológico', value: 'eco' },
  { name: 'Estrelas', value: 'auto_awesome' },
  { name: 'Grupo', value: 'groups' },
  { name: 'Premium', value: 'workspace_premium' },
  { name: 'Honra', value: 'military_tech' },
  { name: 'Cartão', value: 'credit_card' },
  { name: 'Compras', value: 'shopping_cart' }
];

export default function FamilyTab({
  members,
  savingsGoal,
  achievements,
  onUpdateMemberLimit,
  onAddContribution
}: FamilyTabProps) {
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [limitInputValue, setLimitInputValue] = useState('');
  const [contributeMemberId, setContributeMemberId] = useState<string>('ricardo');
  const [contributionAmounts, setContributionAmounts] = useState<Record<string, string>>({});

  // 1. Multiple Goals State
  const [goals, setGoals] = useState<(SavingsGoal & { description?: string; aiPlan?: any })[]>(() => {
    const saved = localStorage.getItem('finfam_goals_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [{
      ...savingsGoal,
      description: 'Nossa meta principal para levar toda a família para a Disney!'
    }];
  });

  // 2. Achievements State
  const [familyAchievements, setFamilyAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('finfam_achievements_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return achievements;
  });

  // Sync states with localStorage
  useEffect(() => {
    localStorage.setItem('finfam_goals_list', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('finfam_achievements_list', JSON.stringify(familyAchievements));
  }, [familyAchievements]);

  // Form toggles and states
  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalCurrent, setNewGoalCurrent] = useState('0');
  const [newGoalImage, setNewGoalImage] = useState(GOAL_IMAGE_PRESETS[0]);
  const [newGoalDesc, setNewGoalDesc] = useState('');

  const [showAddAchievementForm, setShowAddAchievementForm] = useState(false);
  const [newAchTitle, setNewAchTitle] = useState('');
  const [newAchDesc, setNewAchDesc] = useState('');
  const [newAchIcon, setNewAchIcon] = useState('emoji_events');
  const [newAchColor, setNewAchColor] = useState('indigo');
  const [newAchIsUnlocked, setNewAchIsUnlocked] = useState(true);

  // AI Planner Wizard States
  const [isAIPlanningOpen, setIsAIPlanningOpen] = useState(false);
  const [aiStep, setAiStep] = useState(1); // 1: Type, 2: Details, 3: Generation/Output
  const [aiProjectType, setAiProjectType] = useState<'viagem' | 'reforma' | 'carro' | 'educacao' | 'outro'>('viagem');
  const [aiTitle, setAiTitle] = useState('');
  const [aiDurationDays, setAiDurationDays] = useState(7);
  const [aiPersonsCount, setAiPersonsCount] = useState(4);
  const [aiTargetMonths, setAiTargetMonths] = useState(12);
  const [aiIsGenerating, setAiIsGenerating] = useState(false);
  const [aiGeneratingStatus, setAiGeneratingStatus] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [activePlanMode, setActivePlanMode] = useState<'econ' | 'rich'>('econ');
  const [viewingPlanDetails, setViewingPlanDetails] = useState<any>(null);
  const [isRankingDetailsOpen, setIsRankingDetailsOpen] = useState(false);

  const handleEditLimitClick = (m: FamilyMember) => {
    setEditingMemberId(m.id);
    setLimitInputValue(m.spendingLimit.toString());
  };

  const handleSaveLimit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    const parsedLimit = parseFloat(limitInputValue);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      onUpdateMemberLimit(id, parsedLimit);
    }
    setEditingMemberId(null);
  };

  const handleContributeSubmitForGoal = (e: React.FormEvent, goalId: string) => {
    e.preventDefault();
    const amountStr = contributionAmounts[goalId] || '';
    const amount = parseFloat(amountStr);
    if (!isNaN(amount) && amount > 0) {
      setGoals(prev => prev.map(g => {
        if (g.id === goalId) {
          const currentCont = g.memberContributions[contributeMemberId] || 0;
          return {
            ...g,
            currentAmount: g.currentAmount + amount,
            memberContributions: {
              ...g.memberContributions,
              [contributeMemberId]: currentCont + amount
            }
          };
        }
        return g;
      }));

      if (goalId === 'g-1') {
        onAddContribution(amount, contributeMemberId);
      } else {
        onAddContribution(0, contributeMemberId);
      }

      setContributionAmounts(prev => ({ ...prev, [goalId]: '' }));
    }
  };

  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    const target = parseFloat(newGoalTarget);
    const current = parseFloat(newGoalCurrent) || 0;
    if (isNaN(target) || target <= 0) {
      alert('Por favor, insira um valor de meta válido.');
      return;
    }

    const newGoalId = 'g-' + Math.random().toString(36).substring(2, 9);
    const initialContributions: { [memberId: string]: number } = {};
    members.forEach(m => {
      initialContributions[m.id] = m.id === 'ricardo' ? current : 0;
    });

    const newGoal = {
      id: newGoalId,
      title: newGoalTitle.trim(),
      targetAmount: target,
      currentAmount: current,
      imageUrl: newGoalImage,
      description: newGoalDesc.trim() || 'Meta familiar registrada coletivamente.',
      memberContributions: initialContributions
    };

    setGoals(prev => [...prev, newGoal]);

    setNewGoalTitle('');
    setNewGoalTarget('');
    setNewGoalCurrent('0');
    setNewGoalDesc('');
    setShowAddGoalForm(false);
  };

  const handleDeleteGoal = (id: string) => {
    if (id === 'g-1') {
      alert('A meta principal de Orlando não pode ser excluída para preservar o progresso do tutorial.');
      return;
    }
    if (confirm('Deseja realmente remover este projeto/meta da família?')) {
      setGoals(prev => prev.filter(g => g.id !== id));
    }
  };

  const handleAddAchievementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAchTitle.trim()) return;

    const newAchId = 'a-' + Math.random().toString(36).substring(2, 9);
    const newAch: Achievement = {
      id: newAchId,
      title: newAchTitle.trim(),
      description: newAchDesc.trim() || 'Troféu especial conquistado em cooperação familiar.',
      icon: newAchIcon,
      isUnlocked: newAchIsUnlocked,
      colorClass: newAchColor
    };

    setFamilyAchievements(prev => [...prev, newAch]);

    setNewAchTitle('');
    setNewAchDesc('');
    setShowAddAchievementForm(false);
  };

  const triggerAIPlanningGeneration = () => {
    if (!aiTitle.trim()) {
      alert('Por favor, defina um nome ou destino para o projeto/viagem.');
      return;
    }

    setAiIsGenerating(true);
    setAiStep(3);

    const messages = [
      '🔮 Inicializando assistente financeiro FinFam...',
      '🔍 Analisando orçamento de Família Silva e limites individuais...',
      '✈️ Pesquisando estimativas médias de custo e cotações...',
      '📊 Calculando Modo Econômico vs Modo Rico para você...',
      '💡 Elaborando plano de divisão ideal de economia mensal...',
      '✅ Planejamento finalizado com inteligência artificial!'
    ];

    let currentMsgIdx = 0;
    setAiGeneratingStatus(messages[0]);

    const interval = setInterval(() => {
      currentMsgIdx++;
      if (currentMsgIdx < messages.length) {
        setAiGeneratingStatus(messages[currentMsgIdx]);
      } else {
        clearInterval(interval);
        
        const plan = generateAIPlan(aiProjectType, {
          title: aiTitle.trim(),
          durationDays: aiDurationDays,
          personsCount: aiPersonsCount,
          targetMonths: aiTargetMonths
        });
        setGeneratedPlan(plan);
        setAiIsGenerating(false);
      }
    }, 700);
  };

  const applyAIGeneratedGoal = () => {
    if (!generatedPlan) return;

    const targetAmount = activePlanMode === 'econ' ? generatedPlan.econTotal : generatedPlan.richTotal;
    const desc = `Plano de IA (${activePlanMode === 'econ' ? 'Modo Econômico' : 'Modo Rico'}): poupar R$ ${generatedPlan[activePlanMode === 'econ' ? 'monthlyEcon' : 'monthlyRich']}/mês em ${generatedPlan.months} meses.`;

    let image = GOAL_IMAGE_PRESETS[5];
    if (generatedPlan.type === 'viagem') image = GOAL_IMAGE_PRESETS[1];
    else if (generatedPlan.type === 'reforma') image = GOAL_IMAGE_PRESETS[3];
    else if (generatedPlan.type === 'carro') image = GOAL_IMAGE_PRESETS[2];
    else if (generatedPlan.type === 'educacao') image = GOAL_IMAGE_PRESETS[4];

    const newGoalId = 'g-' + Math.random().toString(36).substring(2, 9);
    const initialContributions: { [memberId: string]: number } = {};
    members.forEach(m => {
      initialContributions[m.id] = 0;
    });

    const newGoal = {
      id: newGoalId,
      title: generatedPlan.title,
      targetAmount,
      currentAmount: 0,
      imageUrl: image,
      description: desc,
      memberContributions: initialContributions,
      aiPlan: generatedPlan
    };

    setGoals(prev => [...prev, newGoal]);
    setIsAIPlanningOpen(false);
    setAiTitle('');
    setGeneratedPlan(null);
    alert('Parabéns! O planejamento da IA foi aplicado com sucesso como uma nova Meta Coletiva!');
  };

  const generateAIPlan = (type: string, details: any) => {
    const months = details.targetMonths || 12;
    const title = details.title || 'Projeto';
    
    let econTotal = 5000;
    let richTotal = 15000;
    let categoryIcon = 'flight';
    
    let econItems: string[] = [];
    let richItems: string[] = [];
    let tips: string[] = [];

    if (type === 'viagem') {
      categoryIcon = 'flight';
      const duration = details.durationDays || 5;
      const people = details.personsCount || 4;
      
      const baseCostEcon = duration * people * 150 + 1200;
      const baseCostRich = duration * people * 450 + 5000;
      
      econTotal = Math.round(baseCostEcon);
      richTotal = Math.round(baseCostRich);
      
      econItems = [
        `Hospedagem em pousada familiar avaliada ou Airbnb aconchegante (R$ ${(duration * 130).toLocaleString('pt-BR')} total)`,
        `Passagens promocionais ou viagem terrestre programada de baixo consumo`,
        `Alimentação alternando iFood com jantares caseiros em família (Economia estimada: R$ 800,00)`,
        `Passeios e roteiros focados em pontos turísticos gratuitos e belezas naturais`
      ];
      
      richItems = [
        `Resort ou Hotel 4 estrelas com regime de pensão completa e área de lazer (R$ ${(duration * 400).toLocaleString('pt-BR')} total)`,
        `Passagens aéreas com voo direto, malas despachadas inclusas e assento conforto`,
        `Roteiro gastronômico premium em restaurantes bem conceituados no TripAdvisor`,
        `Ingressos para atrações exclusivas comprados antecipadamente, guias privativos`
      ];

      tips = [
        `Viajar fora de feriados e alta temporada pode reduzir em até 40% a estimativa de passagens e hotéis.`,
        `Com o Modo Econômico, a Família Silva precisa poupar apenas R$ ${Math.round(econTotal / months)} por mês coletivamente.`,
        `Se o Ricardo e a Helena reduzirem jantares fora supérfluos, conseguem bater a meta 2 meses antes do planejado!`
      ];
    } else if (type === 'reforma') {
      categoryIcon = 'construction';
      econTotal = 4000;
      richTotal = 18000;
      
      econItems = [
        `Pintura completa de cômodos no estilo DIY (Faça Você Mesmo) envolvendo Lucas e Bia`,
        `Pesquisa de materiais em lojas de atacado de construção físicas e cupons online`,
        `Restauração e envelopamento de móveis atuais para dar visual moderno`
      ];
      
      richItems = [
        `Contratação de engenheiro/arquiteto especialista para gestão de obra e projeto 3D`,
        `Gesso rebaixado, projeto luminotécnico completo com fitas LED inteligentes`,
        `Móveis planejados sob medida de MDF naval premium com garantia de longo prazo`
      ];

      tips = [
        `Sempre compre materiais de acabamento à vista para negociar descontos que variam de 10% a 15%.`,
        `O trabalho em equipe (Pai, Mãe e filhos) na pintura poupará pelo menos R$ 1.500,00 de mão de obra.`
      ];
    } else if (type === 'carro') {
      categoryIcon = 'directions_car';
      econTotal = 30000;
      richTotal = 85000;
      
      econItems = [
        `Compra de seminovo confiável, econômico, com excelente histórico de revisões`,
        `IPVA de valor reduzido e seguro simplificado de startup`,
        `Aproveitar boa desvalorização de veículos de 3 a 5 anos de uso`
      ];
      
      richItems = [
        `Compra de carro zero quilômetro com motor turbo moderno e central multimídia inclusa`,
        `Pacote completo de garantia de fábrica de 3 a 5 anos e revisões pré-pagas`,
        `Seguro de alta cobertura premium com guincho ilimitado e carro reserva por 30 dias`
      ];

      tips = [
        `Tentem dar pelo menos 50% de entrada para evitar juros abusivos de financiamento longo.`,
        `Um veículo econômico ajudará a poupar no orçamento mensal de transporte da família.`
      ];
    } else if (type === 'educacao') {
      categoryIcon = 'school';
      econTotal = 3500;
      richTotal = 12000;
      
      econItems = [
        `Cursos de qualificação técnicos online com certificação reconhecida nacionalmente`,
        `Aquisição de material didático digital de segunda mão ou bibliotecas públicas`,
        `Equipamentos seminovos revisados com excelente custo-benefício`
      ];
      
      richItems = [
        `Pós-Graduação, MBA presencial em instituição de referência de mercado`,
        `Intercâmbio de curta duração com aulas de imersão de idioma integradas`,
        `Notebook de última geração de alta velocidade de processamento e acessórios premium`
      ];

      tips = [
        `Inscrevam-se em listas de bolsas parciais que frequentemente oferecem até 50% de desconto corporativo.`,
        `Estudar em família estimula o hábito da leitura e pode liberar pontos bônus na plataforma FinFam.`
      ];
    } else {
      categoryIcon = 'stars';
      econTotal = 2000;
      richTotal = 8000;
      
      econItems = [
        `Planejamento enxuto focando apenas no essencial para atingir o objetivo familiar`,
        `Substituição por marcas alternativas de preço acessível e qualidade comprovada`
      ];
      
      richItems = [
        `Foco total em conforto, rapidez, segurança máxima e experiência inesquecível`,
        `Contratação de pacotes tudo incluso com as melhores notas do mercado`
      ];

      tips = [
        `Estabeleçam limites rígidos antes de dar o primeiro passo para não estourar os limites da família.`
      ];
    }

    const monthlyEcon = Math.round(econTotal / months);
    const monthlyRich = Math.round(richTotal / months);

    const splitEcon = {
      ricardo: Math.round(monthlyEcon * 0.45),
      helena: Math.round(monthlyEcon * 0.35),
      lucas: Math.round(monthlyEcon * 0.12),
      bia: Math.round(monthlyEcon * 0.08)
    };

    const splitRich = {
      ricardo: Math.round(monthlyRich * 0.45),
      helena: Math.round(monthlyRich * 0.35),
      lucas: Math.round(monthlyRich * 0.12),
      bia: Math.round(monthlyRich * 0.08)
    };

    return {
      title,
      type,
      categoryIcon,
      months,
      econTotal,
      richTotal,
      monthlyEcon,
      monthlyRich,
      econItems,
      richItems,
      tips,
      splitEcon,
      splitRich
    };
  };

  const sortedMembersByPoints = [...members].sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-6">
      {/* Welcome & Global Level Header */}
      <section className="space-y-3">
        <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5">
          <div>
            <h1 className="text-2xl font-headline font-extrabold text-white">Família Silva</h1>
            <p className="text-xs text-slate-400 font-medium">Você e sua família estão no caminho certo! 85% do orçamento mantido.</p>
          </div>
          <Badge variant="info" icon="military_tech">
            Nível 12: Mestres da Poupança
          </Badge>
        </Card>
      </section>

      {/* Bento Grid: Members and Progress */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Gastos por Membro */}
        <section className="md:col-span-8 space-y-4">
          <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase font-headline">
            Gastos por Membro
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {members.map((m) => {
              const spendingPercent = Math.min(Math.round((m.currentSpending / m.spendingLimit) * 100), 100);
              const isOver = m.currentSpending > m.spendingLimit;
              const isEditing = editingMemberId === m.id;

              return (
                <Card 
                  key={m.id}
                  className={`p-5 flex flex-col justify-between group relative ${
                    isOver 
                      ? 'border-rose-500/40 border-l-4 border-l-rose-500 bg-rose-500/5' 
                      : m.limitStatus === 'Limite próximo'
                      ? 'border-amber-500/40 border-l-4 border-l-amber-500 bg-amber-500/5'
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Avatar src={m.avatarUrl} alt={m.name} size="md" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{m.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{m.role}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-mono font-extrabold text-white">
                        {formatCurrency(m.currentSpending)}
                      </p>
                      <span className={`text-[9px] font-extrabold uppercase tracking-wider ${
                        isOver 
                          ? 'text-rose-400' 
                          : m.limitStatus === 'Limite próximo'
                          ? 'text-amber-400'
                          : 'text-indigo-400'
                      }`}>
                        {isOver ? 'Excedido' : m.limitStatus}
                      </span>
                    </div>
                  </div>

                  {/* Limit Editor */}
                  <div className="mt-4 pt-3 border-t border-white/10">
                    {isEditing ? (
                      <form onSubmit={(e) => handleSaveLimit(e, m.id)} className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={limitInputValue}
                          onChange={e => setLimitInputValue(e.target.value)}
                          required
                          autoFocus
                        />
                        <Button type="submit" size="sm" variant="primary">
                          Salvar
                        </Button>
                        <Button type="button" onClick={() => setEditingMemberId(null)} size="sm" variant="ghost">
                          X
                        </Button>
                      </form>
                    ) : (
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Teto: {formatCurrency(m.spendingLimit)}</span>
                        <button 
                          onClick={() => handleEditLimitClick(m)}
                          className="text-indigo-400 font-bold hover:text-indigo-300 hover:underline cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Ajustar Limite
                        </button>
                      </div>
                    )}
                    
                    <ProgressBar 
                      value={spendingPercent} 
                      className={`mt-1.5 ${isOver ? 'bg-rose-500' : m.limitStatus === 'Limite próximo' ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-500 to-fuchsia-500'}`} 
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Economy Scoreboard / Ranking */}
        <section className="md:col-span-4 space-y-4">
          <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase font-headline">
            Ranking Mensal
          </h2>
          <Card className="text-white p-5 relative overflow-hidden flex flex-col justify-between h-[300px]">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400 fill-icon font-bold">emoji_events</span>
                  <span className="text-xs font-bold font-headline uppercase tracking-wider text-slate-300">Economia</span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Julho</span>
              </div>
              
              <div className="space-y-3.5">
                {sortedMembersByPoints.map((m, idx) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <span className={`font-mono text-sm font-bold ${idx === 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                      {idx + 1}º
                    </span>
                    <Avatar src={m.avatarUrl} alt={m.name} size="xs" />
                    <span className="text-xs font-semibold flex-1 truncate text-slate-200">{m.name.split(' ')[0]}</span>
                    <span className="font-mono text-xs font-bold text-indigo-300">+{m.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={() => setIsRankingDetailsOpen(true)}
              variant="primary"
              fullWidth
              className="mt-4"
            >
              Ver Detalhes do Ranking
            </Button>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full opacity-10 blur-3xl select-none pointer-events-none" />
          </Card>
        </section>
      </div>

      {/* Collective Goals and Projects List */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-2">
          <div>
            <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase font-headline">
              Projetos e Metas de Poupança Coletiva
            </h2>
            <p className="text-[10px] text-slate-500">Planeje e junte dinheiro de forma colaborativa com toda a família.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button 
              onClick={() => setShowAddGoalForm(!showAddGoalForm)}
              variant="secondary"
              size="sm"
              icon="add"
            >
              Criar Projeto
            </Button>
            <Button 
              onClick={() => {
                setIsAIPlanningOpen(true);
                setAiStep(1);
                setAiTitle('');
                setGeneratedPlan(null);
              }}
              variant="primary"
              size="sm"
              icon="psychology"
            >
              Planejar com IA 🔮
            </Button>
          </div>
        </div>

        {/* Create Manual Goal Collapsible Form */}
        {showAddGoalForm && (
          <Card className="p-5 border-indigo-500/20 bg-indigo-500/5 animate-in slide-in-from-top-4 duration-200 text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                <span className="material-symbols-outlined font-bold">add_circle</span>
                Cadastrar Nova Meta Coletiva
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddGoalForm(false)}
                className="material-symbols-outlined text-slate-400 hover:text-white cursor-pointer"
              >
                close
              </button>
            </div>

            <form onSubmit={handleAddGoalSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Título da Meta"
                  placeholder="Ex: Viagem de Férias 2027, Reformar Cozinha"
                  value={newGoalTitle}
                  onChange={e => setNewGoalTitle(e.target.value)}
                  required
                />
                <Input 
                  label="Descrição / Objetivo"
                  placeholder="Ex: Juntar dinheiro para passagens e estadia"
                  value={newGoalDesc}
                  onChange={e => setNewGoalDesc(e.target.value)}
                />
                <Input 
                  label="Valor Alvo (R$)"
                  type="number"
                  placeholder="Ex: 15000"
                  value={newGoalTarget}
                  onChange={e => setNewGoalTarget(e.target.value)}
                  required
                />
                <Input 
                  label="Valor já Inicializado (R$)"
                  type="number"
                  placeholder="Ex: 500"
                  value={newGoalCurrent}
                  onChange={e => setNewGoalCurrent(e.target.value)}
                />
              </div>

              {/* Visual Header Preset Selector */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Escolha uma Imagem de Fundo</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {GOAL_IMAGE_PRESETS.map((url, idx) => {
                    const isSelected = newGoalImage === url;
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setNewGoalImage(url)}
                        className={`relative aspect-[16/10] rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                          isSelected ? 'border-indigo-500 scale-[1.03] shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={url} className="w-full h-full object-cover" alt={`Preset ${idx+1}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <Button type="button" onClick={() => setShowAddGoalForm(false)} variant="ghost">
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Cadastrar Meta
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Goals Loop */}
        <div className="space-y-6">
          {goals.map((goal) => {
            const progressPercent = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
            return (
              <Card key={goal.id} className="p-6 text-left relative group/goal">
                {/* Delete button (non g-1 only) */}
                {goal.id !== 'g-1' && (
                  <button 
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 flex items-center justify-center opacity-0 group-hover/goal:opacity-100 transition-all cursor-pointer border border-rose-500/20"
                    title="Remover meta"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">delete</span>
                  </button>
                )}

                <div className="flex flex-col lg:flex-row gap-6 items-center">
                  {/* Goal Image */}
                  <div className="w-full lg:w-1/3 aspect-[16/10] rounded-xl overflow-hidden relative shadow-md">
                    <img 
                      className="w-full h-full object-cover" 
                      src={goal.imageUrl} 
                      alt={goal.title} 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-4">
                      <span className="text-white font-extrabold text-lg font-headline">
                        {goal.title}
                      </span>
                      {goal.description && (
                        <p className="text-[10px] text-slate-300 font-medium truncate mt-0.5">{goal.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Goal Content */}
                  <div className="flex-1 w-full space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Progresso Coletivo</p>
                          {goal.aiPlan && (
                            <Badge variant="info" icon="psychology">Planejado por IA</Badge>
                          )}
                        </div>
                        <p className="text-lg font-headline font-extrabold text-white">
                          {formatCurrency(goal.currentAmount)} 
                          <span className="text-xs font-medium text-slate-400 font-sans ml-1.5">
                            de {formatCurrency(goal.targetAmount)}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-right">
                        {goal.aiPlan && (
                          <button
                            onClick={() => setViewingPlanDetails(goal.aiPlan)}
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            Ver Plano IA
                          </button>
                        )}
                        <p className="font-mono text-xl font-extrabold text-indigo-400">
                          {formatPercent(progressPercent, 0)}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <ProgressBar value={progressPercent} gradient />

                    {/* Contributions list */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      {members.map((member) => {
                        const contribution = (goal.memberContributions && goal.memberContributions[member.id]) || 0;
                        return (
                          <div key={member.id} className="text-center p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-all">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                              {member.name.split(' ')[0]}
                            </p>
                            <p className="font-mono font-bold text-white text-xs mt-0.5">
                              {formatCurrency(contribution)}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick Deposit Form specific to this Goal */}
                    <form 
                      onSubmit={(e) => handleContributeSubmitForGoal(e, goal.id)} 
                      className="flex flex-wrap items-center gap-3 pt-2 bg-white/5 p-3 rounded-xl border border-white/10"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-indigo-400 animate-pulse">savings</span>
                        <span className="text-xs font-bold text-slate-300">Fazer Depósito:</span>
                      </div>
                      <div className="flex gap-2 flex-1 min-w-[200px]">
                        <Select
                          value={contributeMemberId}
                          onChange={e => setContributeMemberId(e.target.value)}
                          options={members.map(m => ({ value: m.id, label: m.name.split(' ')[0] }))}
                        />
                        <Input
                          type="number"
                          placeholder="Valor R$"
                          value={contributionAmounts[goal.id] || ''}
                          onChange={e => {
                            const val = e.target.value;
                            setContributionAmounts(prev => ({ ...prev, [goal.id]: val }));
                          }}
                          required
                        />
                        <Button type="submit" variant="primary" size="sm">
                          Poupar
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Badges / Achievements Grid with custom creation */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-2">
          <div>
            <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase font-headline">
              Conquistas e Medalhas Coletivas
            </h2>
            <p className="text-[10px] text-slate-500">Troféus destravados ao economizar, cumprir limites e pagar contas em dia.</p>
          </div>
          <Button 
            onClick={() => setShowAddAchievementForm(!showAddAchievementForm)}
            variant="secondary"
            size="sm"
            icon="add"
          >
            Cadastrar Conquista
          </Button>
        </div>

        {/* Add custom Achievement collapsible form */}
        {showAddAchievementForm && (
          <Card className="p-5 border-indigo-500/20 bg-indigo-500/5 animate-in slide-in-from-top-4 duration-200 text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                <span className="material-symbols-outlined font-bold">workspace_premium</span>
                Cadastrar Nova Conquista Familiar
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddAchievementForm(false)}
                className="material-symbols-outlined text-slate-400 hover:text-white cursor-pointer"
              >
                close
              </button>
            </div>

            <form onSubmit={handleAddAchievementSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Nome do Troféu / Conquista"
                  placeholder="Ex: Metas de Viagem, Sem Desperdício"
                  value={newAchTitle}
                  onChange={e => setNewAchTitle(e.target.value)}
                  required
                />
                <Input 
                  label="Descrição / Como Conquistar"
                  placeholder="Ex: Conseguimos poupar R$ 2.000 de forma conjunta"
                  value={newAchDesc}
                  onChange={e => setNewAchDesc(e.target.value)}
                />
                <Select
                  label="Status Inicial"
                  value={newAchIsUnlocked ? 'unlocked' : 'locked'}
                  onChange={e => setNewAchIsUnlocked(e.target.value === 'unlocked')}
                  options={[
                    { value: 'unlocked', label: 'Destravado! (Conquistado! 🔓)' },
                    { value: 'locked', label: 'Bloqueado (Alvo em andamento 🔒)' }
                  ]}
                />
                <Select
                  label="Estilo de Cor / Medalha"
                  value={newAchColor}
                  onChange={e => setNewAchColor(e.target.value)}
                  options={Object.keys(ACHIEVEMENT_COLORS).map(k => ({ value: k, label: k }))}
                />
              </div>

              {/* Icon selection grid */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Escolha um Ícone</label>
                <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                  {ACHIEVEMENT_ICONS.map((ico, idx) => {
                    const isSelected = newAchIcon === ico.value;
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setNewAchIcon(ico.value)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-600 border-indigo-500 text-white font-bold' 
                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                        title={ico.name}
                      >
                        <span className="material-symbols-outlined text-base">{ico.value}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <Button type="button" onClick={() => setShowAddAchievementForm(false)} variant="ghost">
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Salvar Troféu
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Render Achievements Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {familyAchievements.map((ach) => {
            const colorClass = ACHIEVEMENT_COLORS[ach.colorClass as keyof typeof ACHIEVEMENT_COLORS]?.bg || 'bg-white/5';
            const textClass = ACHIEVEMENT_COLORS[ach.colorClass as keyof typeof ACHIEVEMENT_COLORS]?.text || 'text-slate-500';

            return (
              <Card 
                key={ach.id}
                className={`p-5 flex flex-col items-center text-center space-y-3 transition-all group ${
                  ach.isUnlocked 
                    ? 'hover:scale-[1.02] shadow-2xl' 
                    : 'border-dashed border-white/15 opacity-40 grayscale'
                }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 ${
                  ach.isUnlocked ? `${colorClass} ${textClass}` : 'bg-white/5 text-slate-500'
                }`}>
                  <span className={`material-symbols-outlined text-2xl ${ach.isUnlocked ? 'material-symbols-fill' : ''}`}>
                    {ach.icon}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{ach.title}</p>
                  <p className="text-[10px] text-slate-400 font-medium leading-normal mt-1">{ach.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* AI PLANNER MODAL WIZARD */}
      <Modal isOpen={isAIPlanningOpen} onClose={() => setIsAIPlanningOpen(false)} title="Assistente de Planejamento de IA" maxWidth="max-w-3xl">
        {/* STEP 1: Select Project Type */}
        {aiStep === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-150">
            <p className="text-xs text-slate-300">Selecione o tipo de objetivo que sua família deseja planejar:</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { type: 'viagem', name: '✈️ Viagem em Família', desc: 'Passagens, hotéis, roteiros gastronômicos e lazer.' },
                { type: 'reforma', name: '🏠 Reforma ou Decoração', desc: 'Reformar cozinha, sala, quartos ou mobília nova.' },
                { type: 'carro', name: '🚗 Aquisição de Veículo', desc: 'Carro seminovo ou zero, seguros e manutenção.' },
                { type: 'educacao', name: '🎓 Projetos de Educação', desc: 'Faculdade, cursos de qualificação ou intercâmbio.' },
                { type: 'outro', name: '✨ Outro Sonho', desc: 'Projetos personalizados para as necessidades da família.' }
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setAiProjectType(p.type as any);
                    setAiStep(2);
                  }}
                  className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 rounded-2xl text-left transition-all cursor-pointer group"
                >
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 flex items-center justify-between">
                    <span>{p.name}</span>
                    <span className="material-symbols-outlined text-sm text-slate-500 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Input Details */}
        {aiStep === 2 && (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-150">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setAiStep(1)}
                className="text-slate-400 hover:text-white flex items-center gap-0.5 text-xs font-bold uppercase tracking-wider"
              >
                <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
                Voltar
              </button>
              <span className="text-[10px] text-slate-500">•</span>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Etapa 2 de 3: Parâmetros</span>
            </div>

            <div className="space-y-4 pt-1">
              <Input 
                label={aiProjectType === 'viagem' ? 'Destino / Nome da Viagem' : 'Nome do Projeto'}
                placeholder={aiProjectType === 'viagem' ? 'Ex: Viagem para Gramado - RS' : 'Ex: Troca de Sofá & Pintura'}
                value={aiTitle}
                onChange={e => setAiTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {aiProjectType === 'viagem' && (
                  <>
                    <Input 
                      label="Duração (Dias)"
                      type="number"
                      value={aiDurationDays.toString()}
                      onChange={e => setAiDurationDays(parseInt(e.target.value) || 5)}
                      min={1}
                    />
                    <Input 
                      label="Pessoas"
                      type="number"
                      value={aiPersonsCount.toString()}
                      onChange={e => setAiPersonsCount(parseInt(e.target.value) || 4)}
                      min={1}
                    />
                  </>
                )}

                <div className={aiProjectType !== 'viagem' ? 'sm:col-span-3' : ''}>
                  <Input 
                    label="Prazo para Poupar (Meses)"
                    type="number"
                    value={aiTargetMonths.toString()}
                    onChange={e => setAiTargetMonths(parseInt(e.target.value) || 12)}
                    min={1}
                  />
                </div>
              </div>

              <div className="bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10 text-[11px] text-slate-300 leading-relaxed flex gap-2">
                <span className="material-symbols-outlined text-indigo-400 shrink-0 text-lg">info</span>
                <p>Ao clicar abaixo, a inteligência artificial FinFam computará instantaneamente o teto de gastos ideal e dividirá os custos do projeto entre os perfis familiares (Pai, Mãe, Lucas e Bia).</p>
              </div>

              <Button
                onClick={triggerAIPlanningGeneration}
                variant="primary"
                fullWidth
                icon="psychology"
                className="font-headline uppercase tracking-wider"
              >
                Gerar Planejamento Inteligente
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Loading Animation / Generation Results */}
        {aiStep === 3 && (
          <div className="space-y-6">
            {aiIsGenerating ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-200">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <div className="absolute inset-4 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-300 animate-pulse">
                    <span className="material-symbols-outlined text-xl">psychology</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white font-headline">Calculando com IA</h4>
                  <p className="text-xs text-indigo-400 font-bold font-mono transition-all">{aiGeneratingStatus}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in zoom-in-95 duration-200">
                {/* Results Container */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">Resultado Planejado</span>
                    <h3 className="text-lg font-headline font-black text-white mt-2">{generatedPlan?.title}</h3>
                  </div>
                  <div className="flex bg-slate-950/60 p-1 rounded-xl border border-white/10 gap-1 shrink-0">
                    <button
                      onClick={() => setActivePlanMode('econ')}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                        activePlanMode === 'econ' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Modo Econômico 🍃
                    </button>
                    <button
                      onClick={() => setActivePlanMode('rich')}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                        activePlanMode === 'rich' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Modo Rico 💎
                    </button>
                  </div>
                </div>

                {/* Cost statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/2 border border-white/5 rounded-2xl p-4 text-left">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Custo Total Projetado</span>
                    <span className="text-base font-extrabold font-mono text-white block mt-0.5">
                      {formatCurrency(activePlanMode === 'econ' ? generatedPlan?.econTotal : generatedPlan?.richTotal)}
                    </span>
                  </div>
                  <div className="bg-white/2 border border-white/5 rounded-2xl p-4 text-left">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Investimento Coletivo Mensal</span>
                    <span className="text-base font-extrabold font-mono text-indigo-300 block mt-0.5">
                      {formatCurrency(activePlanMode === 'econ' ? generatedPlan?.monthlyEcon : generatedPlan?.monthlyRich)}/mês
                    </span>
                  </div>
                  <div className="bg-white/2 border border-white/5 rounded-2xl p-4 text-left">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Prazo Calculado</span>
                    <span className="text-base font-extrabold text-slate-200 block mt-0.5">{generatedPlan?.months} meses</span>
                  </div>
                </div>

                {/* Items and recommendation splits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left: Plan items breakdown */}
                  <div className="bg-slate-950/40 border border-white/5 p-4 rounded-xl text-left">
                    <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-indigo-400 text-sm">checklist</span>
                      O que está incluído no plano:
                    </h4>
                    <ul className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                      {(activePlanMode === 'econ' ? generatedPlan?.econItems : generatedPlan?.richItems)?.map((item: string, idx: number) => (
                        <li key={idx} className="text-[10px] text-slate-300 flex items-start gap-1.5 leading-relaxed">
                          <span className="text-indigo-400 text-xs shrink-0 select-none">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right: Recommended Split contributors */}
                  <div className="bg-slate-950/40 border border-white/5 p-4 rounded-xl text-left">
                    <h4 className="text-xs font-bold text-white mb-2.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-indigo-400 text-sm">pie_chart</span>
                      Divisão Recomendada de Poupança / Mês:
                    </h4>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {Object.entries((activePlanMode === 'econ' ? generatedPlan?.splitEcon : generatedPlan?.splitRich) || {}).map(([mId, val]: any) => {
                        const memberObj = members.find(m => m.id === mId);
                        if (!memberObj) return null;
                        return (
                          <div key={mId} className="flex items-center justify-between text-[11px] font-bold border-b border-white/5 pb-1">
                            <div className="flex items-center gap-1.5">
                              <Avatar src={memberObj.avatarUrl} alt={memberObj.name} size="xs" />
                              <span className="text-slate-300 font-medium">{memberObj.name.split(' ')[0]}</span>
                            </div>
                            <span className="text-white font-mono font-extrabold">{formatCurrency(val)}/mês</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* AI actionable advice tips */}
                <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl text-[10px] text-left text-slate-300 space-y-1.5">
                  <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm font-bold">lightbulb</span>
                    Dicas e Conselhos da IA FinFam:
                  </h4>
                  <ul className="space-y-1 list-disc list-inside">
                    {generatedPlan?.tips.map((tip: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{tip}</li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2.5 border-t border-white/5 pt-4">
                  <Button onClick={() => setAiStep(2)} variant="ghost">
                    Ajustar Parâmetros
                  </Button>
                  <Button onClick={applyAIGeneratedGoal} variant="primary" icon="add_task">
                    Aplicar Planejamento
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* VIEW PLANNER PERSISTENT MODAL DETAILS */}
      <Modal isOpen={viewingPlanDetails !== null} onClose={() => setViewingPlanDetails(null)} title="Análise de Custos e Roteiro da IA" maxWidth="max-w-2xl">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
              <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Meta Econômica Coletiva</span>
              <span className="text-base font-extrabold font-mono text-white block mt-0.5">{formatCurrency(viewingPlanDetails?.econTotal || 0)}</span>
              <span className="text-[10px] text-indigo-300 font-medium block mt-1">{formatCurrency(viewingPlanDetails?.monthlyEcon || 0)}/mês</span>
            </div>
            <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
              <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Meta Premium Coletiva</span>
              <span className="text-base font-extrabold font-mono text-white block mt-0.5">{formatCurrency(viewingPlanDetails?.richTotal || 0)}</span>
              <span className="text-[10px] text-indigo-300 font-medium block mt-1">{formatCurrency(viewingPlanDetails?.monthlyRich || 0)}/mês</span>
            </div>
          </div>

          {/* Economy/Premium Items */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Roteiro do Modo Econômico 🍃</h4>
            <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5">
              <ul className="space-y-1.5 text-[11px] text-slate-300 leading-relaxed">
                {(viewingPlanDetails?.econItems || []).map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-indigo-400 font-bold shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Roteiro do Modo Premium 💎</h4>
            <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5">
              <ul className="space-y-1.5 text-[11px] text-slate-300 leading-relaxed">
                {(viewingPlanDetails?.richItems || []).map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-indigo-400 font-bold shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={() => setViewingPlanDetails(null)} variant="primary">
              Entendido!
            </Button>
          </div>
        </div>
      </Modal>

      {/* RANKING DETAILS MODAL */}
      <Modal isOpen={isRankingDetailsOpen} onClose={() => setIsRankingDetailsOpen(false)} title="Histórico e Detalhes do Ranking" maxWidth="max-w-2xl">
        <div className="space-y-6">
          {/* Point explanation info bar */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-xs text-indigo-300 leading-relaxed">
            <span className="font-bold block mb-1">💡 Como funciona a pontuação?</span>
            Toda semana os membros que mantiverem seus gastos abaixo do teto recebem bônus. Além disso, contribuir para as metas coletivas de poupança (como a viagem) e economizar nas contas de casa adicionam pontos ao ranking familiar!
          </div>

          {/* Members breakdowns list */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pontuação Atual por Membro</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {members.map((m) => {
                let streak = "3 semanas";
                let recentAchievements = ["Guardião do Orçamento", "Mestre da Poupança"];
                let pointLogs = [
                  { source: "Meta Coletiva (Poupança)", pts: 220 },
                  { source: "Contas Fixas em Dia", pts: 150 },
                  { source: "Teto de Lançamento Atendido", pts: 150 }
                ];

                if (m.id === 'ricardo') {
                  streak = "4 semanas 🔥";
                  recentAchievements = ["Pai Econômico", "Disney VIP"];
                  pointLogs = [
                    { source: "Poupança Disney", pts: 280 },
                    { source: "Luz Reduzida -15%", pts: 120 },
                    { source: "Teto Semanal Atendido", pts: 120 }
                  ];
                } else if (m.id === 'helena') {
                  streak = "5 semanas 🔥";
                  recentAchievements = ["Super Mãe Poupadora", "Contas em Dia"];
                  pointLogs = [
                    { source: "Meta Coletiva Viagem", pts: 260 },
                    { source: "Gestão de Fatura Nubank", pts: 120 },
                    { source: "Bônus de Lançamentos", pts: 100 }
                  ];
                } else if (m.id === 'lucas') {
                  streak = "1 semana 😅";
                  recentAchievements = ["Ajudante de Cozinha", "Poupador Iniciante"];
                  pointLogs = [
                    { source: "Economia em Lanches", pts: 150 },
                    { source: "Meta de Poupança Lucas", pts: 120 },
                    { source: "Teto Semanal Atendido", pts: 80 }
                  ];
                } else if (m.id === 'bia') {
                  streak = "6 semanas 🔥";
                  recentAchievements = ["Caçadora de Descontos", "Econômica Pro"];
                  pointLogs = [
                    { source: "Bônus Desconto Supermercado", pts: 180 },
                    { source: "Cofrinho Coletivo", pts: 100 },
                    { source: "Orçamento Sob Controle", pts: 110 }
                  ];
                }

                return (
                  <Card key={m.id} className="p-4 space-y-3 transition-all">
                    <div className="flex items-center gap-3">
                      <Avatar src={m.avatarUrl} alt={m.name} size="sm" />
                      <div>
                        <span className="text-xs font-bold text-white block">{m.name}</span>
                        <span className="text-[9px] text-indigo-400 font-bold tracking-wider uppercase block">{m.role}</span>
                      </div>
                      <div className="ml-auto text-right">
                        <span className="text-xs font-mono font-black text-amber-400 block">+{m.points} pts</span>
                        <span className="text-[8px] text-slate-500 block">total acumulado</span>
                      </div>
                    </div>

                    {/* Streak and Achievements details */}
                    <div className="border-t border-white/5 pt-2.5 grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-slate-400 block">Sequência:</span>
                        <span className="font-bold text-white">{streak}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Medalha Recente:</span>
                        <span className="font-bold text-indigo-300 truncate block pr-1">{recentAchievements[0]}</span>
                      </div>
                    </div>

                    {/* Point source breakdown */}
                    <div className="bg-white/5 rounded-lg p-2 space-y-1.5 mt-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Últimos Pontos Ganhos:</span>
                      {pointLogs.map((log, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-300 truncate mr-2">{log.source}</span>
                          <span className="font-mono text-indigo-400 font-bold shrink-0">+{log.pts}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={() => setIsRankingDetailsOpen(false)} variant="primary">
              Fechar Detalhes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
