import React, { useState } from 'react';
import { Transaction, FamilyMember, CategoryType } from '../types';
import { Button, Card, ProgressBar, Avatar } from '../components/ui';
import { getCategoryIcon, getCategoryColor } from '../utils/categories';
import { formatCurrency } from '../utils/formatters';

interface DashboardTabProps {
  transactions: Transaction[];
  members: FamilyMember[];
  onNavigateToTab: (tabId: string) => void;
  onOpenNewTransactionModal: () => void;
}

export default function DashboardTab({
  transactions,
  members,
  onNavigateToTab,
  onOpenNewTransactionModal
}: DashboardTabProps) {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);

  // Get active confirmed transactions
  const confirmedTransactions = transactions.filter(t => t.status === 'confirmado');
  
  // Calculate dynamic totals for all 6 categories
  const categoriesDef: { name: CategoryType; color: string; icon: string }[] = [
    { name: 'Moradia', color: '#6366f1', icon: 'home' },         // Indigo
    { name: 'Alimentação', color: '#d946ef', icon: 'restaurant' }, // Fuchsia
    { name: 'Lazer', color: '#22d3ee', icon: 'sports_esports' },   // Cyan
    { name: 'Assinaturas', color: '#fb923c', icon: 'movie' },       // Orange/Amber
    { name: 'Transporte', color: '#38bdf8', icon: 'directions_car' }, // Light Blue
    { name: 'Outros', color: '#94a3b8', icon: 'category' }          // Slate
  ];

  const categoryTotals = categoriesDef.map(cat => {
    const total = confirmedTransactions
      .filter(t => t.category === cat.name)
      .reduce((sum, t) => sum + t.value, 0);
    return { ...cat, total };
  });

  const totalDisplayExpenses = categoryTotals.reduce((sum, cat) => sum + cat.total, 0);

  // Map to active categories list with calculated percentages (filter out categories with zero expenses for a cleaner chart and legend)
  const activeCategoriesList = categoryTotals
    .map(cat => ({
      ...cat,
      percent: totalDisplayExpenses > 0 ? Math.round((cat.total / totalDisplayExpenses) * 100) : 0
    }))
    .filter(cat => cat.total > 0);

  // Fallback for visual representation when there are no expenses yet
  const displayCategoriesList = activeCategoriesList.length > 0 
    ? activeCategoriesList 
    : [{ name: 'Sem Gastos' as any, color: '#475569', percent: 100, icon: 'info', total: 0 }];

  const categoriesList = displayCategoriesList;

  // Dynamic Family Balance: starting base of R$ 15.977,30 minus all confirmed expenses (perfectly yields R$ 14.250,80 with initial data and updates on change)
  const initialBaseBalance = 15977.30;
  const currentTotalExpenses = confirmedTransactions.reduce((sum, t) => sum + t.value, 0);
  const familyBalance = initialBaseBalance - currentTotalExpenses;

  // Dynamic Family Points: sum of all active members' points
  const totalFamilyPoints = members.reduce((sum, m) => sum + m.points, 0);

  // Dynamic Budget limit and current spending
  const totalSpendingLimit = members.reduce((sum, m) => sum + m.spendingLimit, 0);
  const totalCurrentSpending = members.reduce((sum, m) => sum + m.currentSpending, 0);
  const spendingPercentage = totalSpendingLimit > 0 ? Math.round((totalCurrentSpending / totalSpendingLimit) * 100) : 0;

  // Find member by ID helper
  const getMember = (id: string) => {
    return members.find(m => m.id === id) || members[0];
  };

  // SVG parameters for donut chart
  const radius = 50;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="space-y-6">
      {/* Balance Bento Card */}
      <div 
        id="balance-card" 
        className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 p-6 shadow-2xl transition-all hover:shadow-indigo-500/5 hover:border-white/20"
      >
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] select-none pointer-events-none">
          <span className="material-symbols-outlined text-[120px]">
            account_balance_wallet
          </span>
        </div>
        <div className="relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-1.5">
            SALDO TOTAL DA FAMÍLIA
          </span>
          <h2 className="text-3xl md:text-4xl font-black font-headline tracking-tight mb-2 text-white bg-gradient-to-r from-white via-indigo-100 to-indigo-200 bg-clip-text text-transparent">
            {formatCurrency(familyBalance)}
          </h2>
          <div className="flex items-center gap-1.5 text-indigo-400">
            <span className="material-symbols-outlined text-sm font-bold animate-pulse">trending_up</span>
            <span className="text-xs font-bold uppercase tracking-wider">
              +12% este mês
            </span>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3 relative z-10">
          <Button
            id="balance-card-add-btn"
            onClick={onOpenNewTransactionModal}
            variant="primary"
            icon="add_circle"
            className="shadow-lg shadow-indigo-600/35 text-xs"
          >
            NOVO LANÇAMENTO
          </Button>
          <Button
            id="balance-card-details-btn"
            onClick={() => onNavigateToTab('contas')}
            variant="secondary"
            className="text-xs"
          >
            DETALHES
          </Button>
        </div>
      </div>

      {/* Goal Progress & Points Row */}
      <Card 
        id="score-card" 
        className="flex flex-col md:flex-row items-center gap-6 justify-between hover:border-white/20 transition-all"
      >
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-14 h-14 bg-indigo-500/20 text-indigo-300 rounded-2xl flex items-center justify-center shadow-lg border border-indigo-500/30 shrink-0">
            <span className="material-symbols-outlined text-2xl font-bold material-symbols-fill">stars</span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">{totalFamilyPoints} pts</h3>
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              PONTUAÇÃO FAMILIAR
            </p>
          </div>
        </div>
        
        <div className="w-full flex-1 md:max-w-md space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-indigo-400">Limite Consumido: {spendingPercentage}%</span>
            <span className="text-slate-400">Disponível: {formatCurrency(totalSpendingLimit - totalCurrentSpending)}</span>
          </div>
          <ProgressBar 
            value={spendingPercentage}
            gradient={spendingPercentage > 90 ? 'from-rose-500 to-red-600' : 'from-indigo-500 to-fuchsia-500'}
          />
          <p className="text-xs text-slate-400 font-medium text-center md:text-left">
            Orçamento Total: <span className="font-bold text-white">{formatCurrency(totalSpendingLimit)}</span> • Consumido: <span className="font-bold text-[#ff6f8b]">{formatCurrency(totalCurrentSpending)}</span>
          </p>
        </div>
      </Card>

      {/* Bento Row 2: Category Chart & Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Spending Chart */}
        <Card 
          id="spending-category-card" 
          className="md:col-span-5 flex flex-col justify-between hover:border-white/20 transition-all"
        >
          <h3 className="text-lg font-headline font-bold text-white mb-4">
            Gastos por Categoria
          </h3>
          
          <div className="flex flex-col items-center">
            {/* Interactive SVG Donut */}
            <div className="relative w-44 h-44 mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth={strokeWidth - 2}
                />
                {categoriesList.map((cat, idx) => {
                  const strokeDasharray = `${(cat.percent / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                  accumulatedPercent += cat.percent;
                  const isHighlighted = activeCategoryIndex === idx;

                  return (
                    <circle
                      key={cat.name}
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="transparent"
                      stroke={cat.color}
                      strokeWidth={isHighlighted ? strokeWidth + 3 : strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="cursor-pointer transition-all duration-300 hover:stroke-[17px]"
                      onMouseEnter={() => setActiveCategoryIndex(idx)}
                      onMouseLeave={() => setActiveCategoryIndex(null)}
                      style={{
                        transformOrigin: 'center',
                      }}
                    />
                  );
                })}
              </svg>
              
              {/* Centered Total */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">
                  {activeCategoryIndex !== null && categoriesList[activeCategoryIndex] ? categoriesList[activeCategoryIndex].name : 'TOTAL'}
                </span>
                <span className="text-lg font-black text-white">
                  {activeCategoryIndex !== null && categoriesList[activeCategoryIndex]
                    ? formatCurrency(categoriesList[activeCategoryIndex].total)
                    : formatCurrency(totalDisplayExpenses)}
                </span>
                {activeCategoryIndex !== null && categoriesList[activeCategoryIndex] && (
                  <span className="text-[11px] font-bold text-indigo-400">
                    {categoriesList[activeCategoryIndex].percent}%
                  </span>
                )}
              </div>
            </div>

            {/* Category legend */}
            <div className="w-full space-y-2">
              {categoriesList.map((cat, idx) => (
                <div 
                  key={cat.name} 
                  className={`flex items-center justify-between p-1.5 rounded-xl transition-all border border-transparent ${
                    activeCategoryIndex === idx ? 'bg-white/5 border-white/5' : ''
                  }`}
                  onMouseEnter={() => setActiveCategoryIndex(idx)}
                  onMouseLeave={() => setActiveCategoryIndex(null)}
                >
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full shadow-md" 
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-sm text-slate-200 font-medium">{cat.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {cat.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Recent Activity List */}
        <Card 
          id="recent-activities-card" 
          className="md:col-span-7 flex flex-col justify-between hover:border-white/20 transition-all"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-headline font-bold text-white">
              Atividades Recentes
            </h3>
            <button
              onClick={() => onNavigateToTab('lancamentos')}
              className="text-indigo-400 hover:text-indigo-300 font-bold text-xs tracking-wider uppercase hover:underline cursor-pointer"
            >
              VER TUDO
            </button>
          </div>

          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {confirmedTransactions.slice(0, 4).map((t) => {
              const member = getMember(t.memberId);
              return (
                <div 
                  key={t.id} 
                  className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/5 group"
                >
                  <div className="flex items-center gap-3">
                    {/* Category Icon */}
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-300 font-bold group-hover:bg-indigo-500/10 group-hover:text-indigo-300 transition-all border border-white/5">
                      <span className="material-symbols-outlined text-xl">
                        {getCategoryIcon(t.category)}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{t.description}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <Avatar 
                          src={member.avatarUrl} 
                          alt={member.name}
                          size="xs"
                        />
                        <span>{member.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-mono font-extrabold text-rose-400">
                      - {formatCurrency(t.value)}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">{t.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
