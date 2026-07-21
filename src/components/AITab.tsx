import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Transaction, FamilyMember, ChatMessage } from '../types';
import { Button, Card, ProgressBar } from './ui';
import { formatCurrency } from '../utils/formatters';

interface AITabProps {
  transactions: Transaction[];
  members: FamilyMember[];
  onAddTransaction: (newTx: Omit<Transaction, 'id'>) => void;
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => void;
  isAILoading?: boolean;
}

export default function AITab({
  transactions,
  members,
  onAddTransaction,
  chatHistory,
  onSendMessage,
  isAILoading = false
}: AITabProps) {
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the chat viewport whenever history or loading changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAILoading]);
  const [suggestions, setSuggestions] = useState([
    {
      id: 'sug-1',
      title: 'Alerta de Delivery',
      time: 'Agora',
      text: 'Você gastou 15% a mais em Delivery este mês. Tente reduzir para atingir a meta da viagem!',
      icon: 'delivery_dining',
      type: 'warning',
      colorClass: 'border-l-4 border-l-amber-500 bg-amber-500/5',
      avatarBg: 'bg-amber-500/20 text-amber-300 border border-amber-500/20'
    },
    {
      id: 'sug-2',
      title: 'Conta de Luz Menor',
      time: 'Há 2 horas',
      text: 'Parabéns! Sua conta de luz veio R$ 45,00 mais barata que no mês passado. Bom trabalho em família!',
      icon: 'electric_bolt',
      type: 'success',
      colorClass: 'border-l-4 border-l-indigo-500 bg-indigo-500/5',
      avatarBg: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20'
    },
    {
      id: 'sug-3',
      title: 'Recorrência Detectada',
      time: 'Ontem',
      text: 'Identificamos uma nova assinatura de R$ 29,90. Deseja categorizá-la como \'Lazer\'?',
      icon: 'calendar_month',
      type: 'interactive',
      colorClass: 'border-l-4 border-l-fuchsia-500 bg-fuchsia-500/5',
      avatarBg: 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/20',
      actionable: true
    }
  ]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput);
    setChatInput('');
  };

  const handleQuickQuestion = (q: string) => {
    onSendMessage(q);
  };

  const handleCategorizeRecurrence = () => {
    // Add the transaction to Lazer
    onAddTransaction({
      description: 'Nova Assinatura',
      value: 29.90,
      date: 'Hoje, ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      category: 'Lazer',
      card: 'Inter',
      memberId: 'helena',
      status: 'confirmado'
    });
    // Remove suggestion
    setSuggestions(suggestions.filter(s => s.id !== 'sug-3'));
    alert('Assinatura categorizada com sucesso em "Lazer"!');
  };

  const handleIgnoreRecurrence = () => {
    setSuggestions(suggestions.filter(s => s.id !== 'sug-3'));
  };

  return (
    <div className="space-y-6">
      {/* Hero AI Section: Health Score */}
      <Card className="relative overflow-hidden text-white hover:border-white/20">
        <div className="absolute -right-10 -top-10 opacity-10 select-none pointer-events-none animate-pulse">
          <span className="material-symbols-outlined text-[160px] material-symbols-fill text-indigo-400">
            psychology
          </span>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="font-headline text-lg font-bold text-indigo-300">Saúde Financeira</h2>
            <p className="text-sm opacity-80 max-w-xs leading-relaxed text-slate-300">
              Sua família está no caminho certo! Continue economizando para sua meta de viagem.
            </p>
          </div>

          {/* Radial score gauge */}
          <div className="relative flex items-center justify-center w-28 h-28 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle 
                className="text-white/5" 
                cx="56" 
                cy="56" 
                fill="transparent" 
                r="48" 
                stroke="currentColor" 
                strokeWidth="7" 
              />
              <circle 
                className="text-indigo-400 transition-all duration-1000" 
                cx="56" 
                cy="56" 
                fill="transparent" 
                r="48" 
                stroke="currentColor" 
                strokeDasharray="301.6" 
                strokeDashoffset="75.4" // represents 75/100 score
                strokeWidth="7" 
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-headline text-2xl font-black text-white">75</span>
              <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Score</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Prediction Bento Grid (Two Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spend Forecast */}
        <Card className="flex flex-col justify-between hover:border-white/20">
          <div>
            <div className="flex items-center gap-2 mb-4 text-rose-400">
              <span className="material-symbols-outlined material-symbols-fill">trending_up</span>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-headline">
                Previsão de Gastos
              </h3>
            </div>
            <div className="space-y-1">
              <p className="text-xl font-headline font-black text-white">{formatCurrency(4250)}</p>
              <p className="text-xs text-slate-400 font-medium">Estimado até 30 de Nov</p>
            </div>
          </div>
          <div className="mt-6">
            <ProgressBar value={85} height="h-2" />
            <p className="text-right text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
              85% do orçamento familiar
            </p>
          </div>
        </Card>

        {/* Savings Suggestion */}
        <div className="bg-gradient-to-br from-indigo-500/10 via-fuchsia-500/5 to-transparent border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-white/20 transition-all shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined material-symbols-fill text-2xl text-indigo-400 animate-pulse">savings</span>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-headline">
              Meta de Reserva
            </h3>
          </div>
          <p className="text-sm font-semibold leading-relaxed text-slate-200">
            Você pode economizar <span className="font-extrabold text-indigo-300 underline decoration-2 decoration-indigo-500">{formatCurrency(340)}</span> extras este mês se reduzir jantares fora no próximo fim de semana.
          </p>
          <div className="mt-6">
            <Button 
              size="md"
              onClick={() => handleQuickQuestion('Como posso economizar R$ 340 adicionais?')}
            >
              Ver detalhes
            </Button>
          </div>
        </div>
      </div>

      {/* AI Suggestions List */}
      {suggestions.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-headline font-bold text-white uppercase tracking-widest">
            Sugestões da IA
          </h3>
          <div className="space-y-3">
            {suggestions.map((s) => (
              <Card 
                key={s.id} 
                padding="p-4"
                className={`flex gap-4 items-start hover:border-white/20 ${s.colorClass}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${s.avatarBg}`}>
                  <span className="material-symbols-outlined text-2xl">{s.icon}</span>
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <p className="text-sm font-bold text-white">{s.title}</p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.time}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{s.text}</p>
                  
                  {s.actionable && (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm"
                        onClick={handleCategorizeRecurrence}
                      >
                        Sim, categorizar
                      </Button>
                      <Button 
                        size="sm"
                        variant="secondary"
                        onClick={handleIgnoreRecurrence}
                      >
                        Ignorar
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Interactive Chat Bot Section */}
      <Card padding="p-5" className="space-y-4 hover:border-white/20">
        <h3 className="text-sm font-headline font-bold text-white flex items-center gap-1.5">
          <span className="material-symbols-outlined text-indigo-400 material-symbols-fill animate-pulse">chat</span>
          Conversar com a IA da Família
        </h3>
        
        {/* Chat window viewport */}
        <div className="bg-slate-950/40 border border-white/10 rounded-xl p-4 h-[280px] overflow-y-auto space-y-3.5 flex flex-col scroll-smooth">
          {chatHistory.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col max-w-[80%] ${
                msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <div 
                className={`p-3 rounded-2xl text-xs leading-relaxed border ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none border-indigo-500/20 shadow-lg shadow-indigo-600/20' 
                    : 'bg-white/5 border-white/10 text-slate-200 rounded-tl-none shadow-sm'
                }`}
              >
                {msg.sender === 'user' ? (
                  <span className="whitespace-pre-wrap">{msg.text}</span>
                ) : (
                  <div className="markdown-body space-y-2 text-slate-200">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="marker:text-indigo-400 mb-0.5">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-white bg-white/5 px-1 py-0.5 rounded">{children}</strong>,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
              <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {/* Real-time Thinking Indicator */}
          {isAILoading && (
            <div className="flex flex-col max-w-[80%] self-start items-start animate-fade-in">
              <div className="p-3 rounded-2xl text-xs leading-relaxed border bg-white/5 border-white/10 text-slate-300 rounded-tl-none shadow-sm flex items-center gap-1.5">
                <span>FinAI está digitando</span>
                <span className="flex gap-1 items-center py-1">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick questions pills */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 text-[11px] font-bold">
          <button 
            onClick={() => handleQuickQuestion('Como está nossa meta de viagem?')}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 rounded-full border border-white/10 shrink-0 cursor-pointer transition-colors"
          >
            ✈️ Meta de Viagem
          </button>
          <button 
            onClick={() => handleQuickQuestion('Quem gastou mais esta semana?')}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 rounded-full border border-white/10 shrink-0 cursor-pointer transition-colors"
          >
            📈 Quem gastou mais?
          </button>
          <button 
            onClick={() => handleQuickQuestion('Como podemos economizar no supermercado?')}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 rounded-full border border-white/10 shrink-0 cursor-pointer transition-colors"
          >
            💡 Dicas de Economia
          </button>
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            placeholder="Perguntar à IA sobre o orçamento..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-xs text-white outline-none focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <button 
            type="submit"
            className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-lg shadow-indigo-600/35 border border-indigo-500/30 shrink-0"
          >
            <span className="material-symbols-outlined text-sm font-bold material-symbols-fill">send</span>
          </button>
        </form>
      </Card>
    </div>
  );
}
