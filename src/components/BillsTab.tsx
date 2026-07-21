import React, { useState, useEffect } from 'react';
import { Bill } from '../types';
import { Button, Input, Select, Card, ProgressBar, Badge, Modal } from '../components/ui';
import { getCategoryIcon } from '../utils/categories';
import { ICON_OPTIONS } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';

interface BillsTabProps {
  bills: Bill[];
  onToggleBillPaid: (id: string) => void;
  onAddBill: (newBill: Omit<Bill, 'id'>) => void;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function BillsTab({
  bills,
  onToggleBillPaid,
  onAddBill
}: BillsTabProps) {
  // July 2026 aligns with the current default view of the platform
  const [selectedMonth, setSelectedMonth] = useState<number>(6); // July is index 6
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showAddBillForm, setShowAddBillForm] = useState(false);
  const [showProjectionDetails, setShowProjectionDetails] = useState(false);
  
  // New bill state managers
  const [desc, setDesc] = useState('');
  const [valueStr, setValueStr] = useState('');
  const [dueDate, setDueDate] = useState('Dia 15');
  const [icon, setIcon] = useState('home');

  // Predefined premium categories + user created categories
  const [categories, setCategories] = useState<{ name: string; icon: string }[]>(() => {
    const saved = localStorage.getItem('finfam_bill_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { name: 'Moradia', icon: 'home' },
      { name: 'Energia', icon: 'electric_bolt' },
      { name: 'Internet', icon: 'wifi' },
      { name: 'Condomínio', icon: 'apartment' },
      { name: 'Entretenimento', icon: 'movie' },
      { name: 'Prestação do Veículo', icon: 'directions_car' },
      { name: 'Mensalidade Escolar', icon: 'school' },
      { name: 'Van Escolar', icon: 'airport_shuttle' },
      { name: 'Plano de Saúde', icon: 'health_and_safety' },
      { name: 'Outros', icon: 'receipt_long' },
    ];
  });

  // Custom Category creation states
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('home');

  useEffect(() => {
    localStorage.setItem('finfam_bill_categories', JSON.stringify(categories));
  }, [categories]);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    const exists = categories.some(
      cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    );
    if (exists) {
      alert("Esta categoria já existe!");
      return;
    }

    const newCat = {
      name: newCategoryName.trim(),
      icon: newCategoryIcon
    };

    setCategories(prev => [...prev, newCat]);
    
    // Auto select the newly created category's icon
    setIcon(newCategoryIcon);
    
    // Clear state & close category creation
    setNewCategoryName('');
    setShowAddCategoryForm(false);
  };

  // Load and save monthly bill paid/pending statuses locally, keyed by "billId-year-month"
  const [monthlyStatus, setMonthlyStatus] = useState<Record<string, 'pago' | 'pendente' | 'proximo_vencimento'>>(() => {
    const saved = localStorage.getItem('finfam_monthly_bills_status');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // error parsing
      }
    }
    
    // Default initial data mapping for July 2026 (Year 2026, Month 6)
    return {
      'b-1-2026-6': 'pago',
      'b-2-2026-6': 'proximo_vencimento',
      'b-3-2026-6': 'pendente',
      'b-4-2026-6': 'pendente'
    };
  });

  useEffect(() => {
    localStorage.setItem('finfam_monthly_bills_status', JSON.stringify(monthlyStatus));
  }, [monthlyStatus]);

  // Helper to parse day number from dueDate string (e.g. "Dia 15" -> 15, "Hoje" -> 21)
  const getDayFromDueDate = (dueDateStr: string): number => {
    if (dueDateStr.toLowerCase() === 'hoje') {
      return 21; // July 21, 2026 in application mock
    }
    const match = dueDateStr.match(/\d+/);
    if (match) {
      return parseInt(match[0], 10);
    }
    return 15; // default fallback
  };

  // Switch Month Navigation handlers
  const handlePrevMonth = () => {
    setSelectedDay(null);
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    setSelectedDay(null);
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  // Helper to get active status of a bill for the current month and year
  const getBillActiveStatus = (bill: Bill): 'pago' | 'pendente' | 'proximo_vencimento' => {
    const key = `${bill.id}-${selectedYear}-${selectedMonth}`;
    
    // If it's explicitly marked as 'pago' in state, return 'pago'
    if (monthlyStatus[key] === 'pago') {
      return 'pago';
    }
    
    // Otherwise, dynamically evaluate if it's overdue (vencida)
    const dueDay = getDayFromDueDate(bill.dueDate);
    const todayYear = 2026;
    const todayMonth = 6; // July is 6 (0-indexed)
    const todayDay = 21; // July 21, 2026
    
    // Check if the selected month/year is in the past compared to July 2026
    const isPastPeriod = 
      selectedYear < todayYear || 
      (selectedYear === todayYear && selectedMonth < todayMonth);
      
    // Check if the selected month/year is the current month
    const isCurrentPeriod = 
      selectedYear === todayYear && selectedMonth === todayMonth;
      
    if (isPastPeriod) {
      return 'proximo_vencimento'; // Overdue / Vencida
    }
    
    if (isCurrentPeriod) {
      // If the due date has already passed
      if (dueDay < todayDay) {
        return 'proximo_vencimento'; // Overdue / Vencida
      }
      // If it is today ("Hoje") or within 2 days, it's urgent / close to due
      if (dueDay === todayDay) {
        return 'proximo_vencimento'; // Energia Elétrica (Hoje)
      }
    }
    
    return 'pendente';
  };

  const handleToggleLocalBillPaid = (billId: string) => {
    const key = `${billId}-${selectedYear}-${selectedMonth}`;
    const current = getBillActiveStatus(bills.find(b => b.id === billId)!);
    const nextStatus = current === 'pago' ? 'pendente' : 'pago';
    
    setMonthlyStatus(prev => ({
      ...prev,
      [key]: nextStatus
    }));

    // Trigger parent toggle to reward family member points in state
    onToggleBillPaid(billId);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedVal = parseFloat(valueStr.replace(',', '.'));
    if (!desc || isNaN(parsedVal)) return;

    onAddBill({
      description: desc,
      value: parsedVal,
      dueDate,
      icon,
      status: 'pendente',
      notificationEnabled: true
    });

    // Reset Form
    setDesc('');
    setValueStr('');
    setDueDate('Dia 15');
    setShowAddBillForm(false);
  };

  // Calculate percentage paid for the SELECTED month
  const totalBills = bills.length;
  const paidBillsCount = bills.filter(b => getBillActiveStatus(b) === 'pago').length;
  const paidPercentage = totalBills > 0 ? Math.round((paidBillsCount / totalBills) * 100) : 0;
  
  // Calculate total unpaid & paid values for the SELECTED month
  const totalUnpaidValue = bills
    .filter(b => getBillActiveStatus(b) !== 'pago')
    .reduce((sum, b) => sum + b.value, 0);

  const totalPaidValue = bills
    .filter(b => getBillActiveStatus(b) === 'pago')
    .reduce((sum, b) => sum + b.value, 0);

  // Calendar days calculations
  const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const daysInMonth = Array.from({ length: totalDays }, (_, i) => i + 1);
  const blankDaysBefore = new Date(selectedYear, selectedMonth, 1).getDay(); // Weekday of the 1st of that month

  // Handle Day Click to filter bills
  const handleDayClick = (day: number) => {
    if (selectedDay === day) {
      setSelectedDay(null); // toggle clear filter
    } else {
      setSelectedDay(day);
    }
  };

  // Filter bills based on selectedDay
  const filteredBills = selectedDay
    ? bills.filter(b => getDayFromDueDate(b.dueDate) === selectedDay)
    : bills;

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-headline font-extrabold text-white">Contas a Pagar</h1>
        <p className="text-xs text-slate-400 font-medium">Mantenha as finanças da família organizadas e em dia.</p>
      </div>

      {/* Grid: Calendar & Stats Left, Bills Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Stats & Calendar */}
        <div className="md:col-span-5 space-y-6">
          {/* Indicators Summary */}
          <Card padding="p-6" className="shadow-sm hover:border-white/20 transition-all">
            <h2 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-4">
              Resumo de {MONTH_NAMES[selectedMonth]} {selectedYear}
            </h2>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-end">
                <span className="text-xs text-slate-400 font-medium">A pagar este mês</span>
                <span className="font-mono text-xl font-extrabold text-white">
                  {formatCurrency(totalUnpaidValue)}
                </span>
              </div>
              <ProgressBar value={paidPercentage} height="h-2.5" className="bg-white/5 border border-white/5" />
              <p className="text-xs text-indigo-400 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm font-bold animate-pulse">check_circle</span>
                {paidPercentage}% das contas pagas ({paidBillsCount} de {totalBills})
              </p>
            </div>
          </Card>

          {/* Mini Calendar */}
          <Card padding="p-5" className="shadow-sm hover:border-white/20 transition-all">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-white font-headline">
                {MONTH_NAMES[selectedMonth]} {selectedYear}
              </h2>
              <div className="flex gap-1.5">
                <button 
                  onClick={handlePrevMonth}
                  className="material-symbols-outlined text-slate-400 hover:text-white transition-colors select-none cursor-pointer"
                  title="Mês anterior"
                >
                  chevron_left
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="material-symbols-outlined text-slate-400 hover:text-white transition-colors select-none cursor-pointer"
                  title="Próximo mês"
                >
                  chevron_right
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-y-2 text-center text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              <span>D</span>
              <span>S</span>
              <span>T</span>
              <span>Q</span>
              <span>Q</span>
              <span>S</span>
              <span>S</span>
            </div>

            <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs font-medium mt-2">
              {/* Padding empty slots */}
              {Array.from({ length: blankDaysBefore }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              
              {daysInMonth.map((day) => {
                const isSelected = selectedDay === day;
                
                // Find bills for this day of the month
                const dayBills = bills.filter(b => getDayFromDueDate(b.dueDate) === day);
                
                const hasPaid = dayBills.some(b => getBillActiveStatus(b) === 'pago');
                const hasUrgent = dayBills.some(b => getBillActiveStatus(b) === 'proximo_vencimento');
                const hasPending = dayBills.some(b => getBillActiveStatus(b) === 'pendente');

                return (
                  <button
                    key={`day-${day}`}
                    onClick={() => handleDayClick(day)}
                    className={`py-1.5 rounded-full relative cursor-pointer font-bold transition-all flex items-center justify-center mx-auto w-8 h-8 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    {day}
                    {!isSelected && hasUrgent && (
                      <span className="absolute bottom-1 w-1 h-1 bg-rose-500 rounded-full" />
                    )}
                    {!isSelected && hasPaid && !hasUrgent && (
                      <span className="absolute bottom-1 w-1 h-1 bg-emerald-500 rounded-full" />
                    )}
                    {!isSelected && hasPending && !hasUrgent && !hasPaid && (
                      <span className="absolute bottom-1 w-1 h-1 bg-amber-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="mt-5 pt-3 border-t border-white/10 flex gap-4 overflow-x-auto hide-scrollbar select-none">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pago</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vencida</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pendente</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: List of Bills */}
        <div className="md:col-span-7 space-y-6">
          {/* Fixed Bills Ledger */}
          <Card className="shadow-2xl overflow-hidden hover:border-white/20 transition-all border border-white/10" padding="">
            <div className="px-5 py-4 border-b border-white/10 flex flex-col sm:flex-row gap-3 justify-between sm:items-center bg-white/2">
              <div>
                <h2 className="text-base font-headline font-bold text-white flex items-center gap-2">
                  <span>Contas Fixas</span>
                  {selectedDay && (
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/20 animate-in zoom-in-90 duration-150">
                      Dia {selectedDay}
                    </span>
                  )}
                </h2>
                <p className="text-[10px] text-slate-400">
                  {selectedDay 
                    ? `Mostrando contas com vencimento no dia ${selectedDay}.`
                    : 'Toque em um dia no calendário para filtrar as contas desse dia.'}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {selectedDay && (
                  <button 
                    onClick={() => setSelectedDay(null)}
                    className="text-indigo-400 hover:text-indigo-300 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
                  >
                    Ver Todas
                  </button>
                )}
                <button 
                  onClick={() => setShowAddBillForm(!showAddBillForm)}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Nova Conta
                </button>
              </div>
            </div>

            {/* Add Bill collapsable Form */}
            {showAddBillForm && (
              <form onSubmit={handleFormSubmit} className="p-5 border-b border-white/10 bg-white/5 space-y-3 animate-in slide-in-from-top-4 duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Nome da Conta (ex: Aluguel, Luz)"
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Valor (R$)"
                    value={valueStr}
                    onChange={e => setValueStr(e.target.value)}
                    className="font-mono"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vencimento</label>
                    <Input
                      placeholder="Vencimento (ex: Dia 15, Hoje)"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categoria / Ícone</label>
                      <button
                        type="button"
                        onClick={() => setShowAddCategoryForm(!showAddCategoryForm)}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[12px] font-bold">add</span>
                        Nova Categoria
                      </button>
                    </div>
                    <Select
                      value={icon}
                      onChange={e => setIcon(e.target.value)}
                      options={categories.map(cat => ({ value: cat.icon, label: cat.name }))}
                    />
                  </div>
                </div>

                {/* Create Category collapsible Sub-form */}
                {showAddCategoryForm && (
                  <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-3 animate-in slide-in-from-top-2 duration-150">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm font-bold">category</span>
                        Criar Nova Categoria & Ícone
                      </h4>
                      <button 
                        type="button"
                        onClick={() => setShowAddCategoryForm(false)}
                        className="material-symbols-outlined text-slate-400 hover:text-white text-base cursor-pointer"
                      >
                        close
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nome da Categoria</label>
                        <Input
                          placeholder="Ex: Prestação do Veículo, Escola, etc."
                          value={newCategoryName}
                          onChange={e => setNewCategoryName(e.target.value)}
                          className="text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Selecione um Ícone</label>
                        <div className="grid grid-cols-5 gap-2 bg-slate-950/30 p-2 rounded-xl border border-white/5">
                          {ICON_OPTIONS.map((iconOpt) => {
                            const isSelected = newCategoryIcon === iconOpt;
                            return (
                              <button
                                type="button"
                                key={iconOpt}
                                onClick={() => setNewCategoryIcon(iconOpt)}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer border ${
                                  isSelected
                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md font-bold'
                                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                                }`}
                                title={iconOpt}
                              >
                                <span className="material-symbols-outlined text-base">
                                  {iconOpt}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAddCategoryForm(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={handleAddCategory}
                        >
                          Salvar Categoria
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-2.5 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddBillForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                  >
                    Adicionar
                  </Button>
                </div>
              </form>
            )}

            {/* List */}
            <div className="divide-y divide-white/5">
              {filteredBills.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Nenhuma conta cadastrada para este dia ou vencimento.
                </div>
              ) : (
                filteredBills.map((bill) => {
                  const isPaid = getBillActiveStatus(bill) === 'pago';
                  const isNear = getBillActiveStatus(bill) === 'proximo_vencimento';
                  
                  return (
                    <div 
                      key={bill.id} 
                      className="p-5 hover:bg-white/5 transition-all flex items-center justify-between relative group"
                    >
                      {isNear && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
                      )}
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <button
                          onClick={() => handleToggleLocalBillPaid(bill.id)}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                            isPaid 
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30' 
                              : isNear
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30'
                          }`}
                          title={isPaid ? "Marcar como pendente" : "Marcar como pago"}
                        >
                          <span className={`material-symbols-outlined text-2xl ${isPaid ? 'material-symbols-fill' : ''}`}>
                            {bill.icon}
                          </span>
                        </button>

                        <div>
                          <h3 className="text-sm font-bold text-white">{bill.description}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-400">Vencimento: {bill.dueDate}</span>
                            <span className="text-slate-600">•</span>
                            <span className="material-symbols-outlined text-xs text-indigo-400 font-bold">
                              {bill.notificationEnabled ? 'notifications_active' : 'notifications'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-extrabold text-sm text-white">
                          {formatCurrency(bill.value)}
                        </div>
                        <div onClick={() => handleToggleLocalBillPaid(bill.id)} className="cursor-pointer mt-1 inline-block">
                          <Badge variant={isPaid ? 'success' : isNear ? 'danger' : 'warning'}>
                            {isPaid ? 'PAGO' : isNear ? 'VENCIDA' : 'PENDENTE'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Monthly Projection Card */}
          <div className="bg-gradient-to-br from-indigo-500/10 via-fuchsia-500/5 to-transparent backdrop-blur-2xl border border-white/10 rounded-2xl p-6 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/10 opacity-20 rounded-full blur-3xl select-none pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h2 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                  Projeção Mensal de {MONTH_NAMES[selectedMonth]}
                </h2>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold font-mono text-white">
                    {formatCurrency(totalPaidValue + totalUnpaidValue)}
                  </span>
                  <span className="text-xs text-slate-400">Total estimado</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t border-white/5 sm:border-0">
                <div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                    Restam para fechar
                  </div>
                  <div className="text-base font-extrabold font-mono text-slate-200">
                    {formatCurrency(totalUnpaidValue)}
                  </div>
                </div>
                <Button 
                  onClick={() => setShowProjectionDetails(true)}
                  variant="primary"
                >
                  Ver Detalhes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projection Details Modal */}
      <Modal 
        isOpen={showProjectionDetails} 
        onClose={() => setShowProjectionDetails(false)} 
        title="Projeção Mensal & Fluxo de Caixa" 
        subtitle={`Análise detalhada de vencimentos e projeção de gastos para ${MONTH_NAMES[selectedMonth]} ${selectedYear}.`}
        maxWidth="max-w-4xl"
      >
            {/* Core Projection Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Receita Mensal Familiar</span>
                  <span className="text-lg font-black text-white font-mono font-bold">{formatCurrency(15977.30)}</span>
                </div>
              </div>

              <div className="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <span className="material-symbols-outlined text-2xl">payments</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total de Contas</span>
                  <span className="text-lg font-black text-white font-mono font-bold">{formatCurrency(totalPaidValue + totalUnpaidValue)}</span>
                </div>
              </div>

              <div className="bg-sky-500/5 border border-sky-500/10 p-5 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                  <span className="material-symbols-outlined text-2xl">savings</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Saldo Livre Restante</span>
                  <span className="text-lg font-black text-white font-mono font-bold">{formatCurrency(15977.30 - (totalPaidValue + totalUnpaidValue))}</span>
                </div>
              </div>
            </div>

            {/* Main Analysis Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Card: Progress & Status Breakdowns */}
              <div className="bg-white/2 border border-white/5 rounded-2xl p-5 space-y-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-400 text-lg">donut_large</span>
                  Status dos Pagamentos
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-indigo-400">Progresso de Quitação</span>
                    <span className="text-white font-mono">{paidPercentage}% Concluído</span>
                  </div>
                  <ProgressBar value={paidPercentage} height="h-4" gradient="from-indigo-500 via-purple-500 to-fuchsia-500" className="p-0.5 bg-slate-950/60" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5 text-left">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Pago</span>
                    <span className="text-base font-black text-indigo-300 font-mono">{formatCurrency(totalPaidValue)}</span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">{paidBillsCount} contas quitadas</span>
                  </div>
                  <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5 text-left">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Pendente</span>
                    <span className="text-base font-black text-rose-400 font-mono">{formatCurrency(totalUnpaidValue)}</span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">{totalBills - paidBillsCount} pendências</span>
                  </div>
                </div>

                {/* Flow recommendation or forecast message */}
                <div className="bg-indigo-500/5 p-3.5 rounded-xl border border-indigo-500/10 text-xs text-slate-300 leading-relaxed flex gap-2.5 text-left">
                  <span className="material-symbols-outlined text-indigo-400 shrink-0">info</span>
                  <p>
                    {paidPercentage === 100 
                      ? "Parabéns! Todas as contas fixas planejadas para este mês estão totalmente pagas. O fluxo de caixa está saudável."
                      : `Seu fluxo de caixa está estável. Você precisa reservar ${formatCurrency(totalUnpaidValue)} nas contas bancárias da família para garantir o pagamento das contas restantes.`}
                  </p>
                </div>
              </div>

              {/* Right Card: Expenses Categorization & Forecast */}
              <div className="bg-white/2 border border-white/5 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-400 text-lg">category</span>
                  Contas por Categoria / Ícone
                </h3>

                <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
                  {categories.map((cat, idx) => {
                    // Calculate sum of bills for this category icon
                    const catBills = bills.filter(b => b.icon === cat.icon);
                    const catTotal = catBills.reduce((sum, b) => sum + b.value, 0);
                    const totalMonthBills = totalPaidValue + totalUnpaidValue;
                    const catPercent = totalMonthBills > 0 ? Math.round((catTotal / totalMonthBills) * 100) : 0;

                    if (catTotal === 0) return null; // skip zero total categories

                    return (
                      <div key={idx} className="space-y-1.5 text-left">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <span className="material-symbols-outlined text-slate-400 text-base">{cat.icon}</span>
                            <span>{cat.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-white font-mono">{formatCurrency(catTotal)}</span>
                            <span className="text-slate-500 font-normal text-[10px] ml-1.5">({catPercent}%)</span>
                          </div>
                        </div>
                        <ProgressBar value={catPercent} height="h-1.5" className="bg-slate-950/60" />
                      </div>
                    );
                  })}

                  {/* Check if all are zero */}
                  {bills.length === 0 && (
                    <div className="text-center text-slate-500 text-xs py-10">
                      Nenhuma conta disponível para classificar por categoria.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Concentration of Due Dates */}
            <div className="mt-6 bg-white/2 border border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-indigo-400 text-lg">calendar_month</span>
                Agenda de Vencimentos
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                {[
                  { label: 'Início do Mês (Dias 1-10)', range: [1, 10], color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' },
                  { label: 'Meio do Mês (Dias 11-20)', range: [11, 20], color: 'border-indigo-500/20 text-indigo-400 bg-indigo-500/5' },
                  { label: 'Fim do Mês (Dias 21-31)', range: [21, 31], color: 'border-fuchsia-500/20 text-fuchsia-400 bg-fuchsia-500/5' },
                  { label: 'Hoje/Imediato', range: null, isToday: true, color: 'border-rose-500/20 text-rose-400 bg-rose-500/5' }
                ].map((item, idx) => {
                  let itemBills = [];
                  if (item.isToday) {
                    itemBills = bills.filter(b => b.dueDate.toLowerCase() === 'hoje');
                  } else if (item.range) {
                    itemBills = bills.filter(b => {
                      const d = getDayFromDueDate(b.dueDate);
                      return d >= item.range![0] && d <= item.range![1] && b.dueDate.toLowerCase() !== 'hoje';
                    });
                  }
                  const itemTotal = itemBills.reduce((sum, b) => sum + b.value, 0);

                  return (
                    <div key={idx} className={`border rounded-xl p-3.5 space-y-1 ${item.color}`}>
                      <span className="text-[9px] font-bold uppercase tracking-wider block text-slate-400">{item.label}</span>
                      <span className="text-base font-extrabold font-mono block text-white font-bold">{formatCurrency(itemTotal)}</span>
                      <span className="text-[10px] text-slate-500 font-medium block">{itemBills.length} contas associadas</span>
                    </div>
                  );
                })}
              </div>
            </div>
        {/* Core Projection Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Receita Mensal Familiar</span>
              <span className="text-lg font-black text-white font-mono font-bold">{formatCurrency(15977.30)}</span>
            </div>
          </div>

          <div className="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total de Contas</span>
              <span className="text-lg font-black text-white font-mono font-bold">{formatCurrency(totalPaidValue + totalUnpaidValue)}</span>
            </div>
          </div>

          <div className="bg-sky-500/5 border border-sky-500/10 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
              <span className="material-symbols-outlined text-2xl">savings</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Saldo Livre Restante</span>
              <span className="text-lg font-black text-white font-mono font-bold">{formatCurrency(15977.30 - (totalPaidValue + totalUnpaidValue))}</span>
            </div>
          </div>
        </div>

        {/* Main Analysis Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Card: Progress & Status Breakdowns */}
          <div className="bg-white/2 border border-white/5 rounded-2xl p-5 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400 text-lg">donut_large</span>
              Status dos Pagamentos
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-indigo-400">Progresso de Quitação</span>
                <span className="text-white font-mono">{paidPercentage}% Concluído</span>
              </div>
              <ProgressBar value={paidPercentage} height="h-4" gradient="from-indigo-500 via-purple-500 to-fuchsia-500" className="p-0.5 bg-slate-950/60" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5 text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Pago</span>
                <span className="text-base font-black text-indigo-300 font-mono">{formatCurrency(totalPaidValue)}</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">{paidBillsCount} contas quitadas</span>
              </div>
              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5 text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Pendente</span>
                <span className="text-base font-black text-rose-400 font-mono">{formatCurrency(totalUnpaidValue)}</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">{totalBills - paidBillsCount} pendências</span>
              </div>
            </div>

            {/* Flow recommendation or forecast message */}
            <div className="bg-indigo-500/5 p-3.5 rounded-xl border border-indigo-500/10 text-xs text-slate-300 leading-relaxed flex gap-2.5 text-left">
              <span className="material-symbols-outlined text-indigo-400 shrink-0">info</span>
              <p>
                {paidPercentage === 100 
                  ? "Parabéns! Todas as contas fixas planejadas para este mês estão totalmente pagas. O fluxo de caixa está saudável."
                  : `Seu fluxo de caixa está estável. Você precisa reservar ${formatCurrency(totalUnpaidValue)} nas contas bancárias da família para garantir o pagamento das contas restantes.`}
              </p>
            </div>
          </div>

          {/* Right Card: Expenses Categorization & Forecast */}
          <div className="bg-white/2 border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-400 text-lg">category</span>
              Contas por Categoria / Ícone
            </h3>

            <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
              {categories.map((cat, idx) => {
                // Calculate sum of bills for this category icon
                const catBills = bills.filter(b => b.icon === cat.icon);
                const catTotal = catBills.reduce((sum, b) => sum + b.value, 0);
                const totalMonthBills = totalPaidValue + totalUnpaidValue;
                const catPercent = totalMonthBills > 0 ? Math.round((catTotal / totalMonthBills) * 100) : 0;

                if (catTotal === 0) return null; // skip zero total categories

                return (
                  <div key={idx} className="space-y-1.5 text-left">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <span className="material-symbols-outlined text-slate-400 text-base">{cat.icon}</span>
                        <span>{cat.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-mono">{formatCurrency(catTotal)}</span>
                        <span className="text-slate-500 font-normal text-[10px] ml-1.5">({catPercent}%)</span>
                      </div>
                    </div>
                    <ProgressBar value={catPercent} height="h-1.5" className="bg-slate-950/60" />
                  </div>
                );
              })}

              {/* Check if all are zero */}
              {bills.length === 0 && (
                <div className="text-center text-slate-500 text-xs py-10">
                  Nenhuma conta disponível para classificar por categoria.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Concentration of Due Dates */}
        <div className="mt-6 bg-white/2 border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-indigo-400 text-lg">calendar_month</span>
            Agenda de Vencimentos
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            {[
              { label: 'Início do Mês (Dias 1-10)', range: [1, 10], color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' },
              { label: 'Meio do Mês (Dias 11-20)', range: [11, 20], color: 'border-indigo-500/20 text-indigo-400 bg-indigo-500/5' },
              { label: 'Fim do Mês (Dias 21-31)', range: [21, 31], color: 'border-fuchsia-500/20 text-fuchsia-400 bg-fuchsia-500/5' },
              { label: 'Hoje/Imediato', range: null, isToday: true, color: 'border-rose-500/20 text-rose-400 bg-rose-500/5' }
            ].map((item, idx) => {
              let itemBills = [];
              if (item.isToday) {
                itemBills = bills.filter(b => b.dueDate.toLowerCase() === 'hoje');
              } else if (item.range) {
                itemBills = bills.filter(b => {
                  const d = getDayFromDueDate(b.dueDate);
                  return d >= item.range![0] && d <= item.range![1] && b.dueDate.toLowerCase() !== 'hoje';
                });
              }
              const itemTotal = itemBills.reduce((sum, b) => sum + b.value, 0);

              return (
                <div key={idx} className={`border rounded-xl p-3.5 space-y-1 ${item.color}`}>
                  <span className="text-[9px] font-bold uppercase tracking-wider block text-slate-400">{item.label}</span>
                  <span className="text-base font-extrabold font-mono block text-white font-bold">{formatCurrency(itemTotal)}</span>
                  <span className="text-[10px] text-slate-500 font-medium block">{itemBills.length} contas associadas</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-8 pt-4 border-t border-white/5 flex justify-end">
          <Button onClick={() => setShowProjectionDetails(false)} variant="primary">
            Fechar Projeção
          </Button>
        </div>
      </Modal>
    </div>
  );
}
