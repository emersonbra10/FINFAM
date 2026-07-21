import React, { useState, useEffect } from 'react';
import { Transaction, Bill, FamilyMember, SavingsGoal, Achievement, ChatMessage, CreditCard } from './types';
import { 
  INITIAL_MEMBERS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_BILLS, 
  INITIAL_GOAL, 
  INITIAL_ACHIEVEMENTS 
} from './initialData';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Spinner } from './components/ui';

import { useSupabaseAuth } from './hooks/useSupabaseAuth';

// Component imports
import Header from './components/Header';
import BottomNavigation, { TabId } from './components/BottomNavigation';
import BackgroundGlow from './components/BackgroundGlow';
import DashboardTab from './components/DashboardTab';
import TransactionsTab from './components/TransactionsTab';
import BillsTab from './components/BillsTab';
import FamilyTab from './components/FamilyTab';
import AITab from './components/AITab';
import SettingsTab from './components/SettingsTab';
import LoginScreen from './components/LoginScreen';

const INITIAL_CARDS: CreditCard[] = [
  {
    id: 'c-1',
    name: 'Nubank Ricardo',
    limit: 5000,
    usedLimit: 1652.10,
    closingDay: 2,
    dueDay: 9,
    brand: 'Mastercard',
    color: 'purple'
  },
  {
    id: 'c-2',
    name: 'Inter Helena',
    limit: 4000,
    usedLimit: 140.80,
    closingDay: 5,
    dueDay: 12,
    brand: 'Visa',
    color: 'orange'
  }
];

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  
  // Supabase Auth Hook
  const { supabaseProfile, signOut: supabaseSignOut, loading: supabaseLoading } = useSupabaseAuth();

  // Auth State
  const [currentUser, setCurrentUser] = useState<FamilyMember | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  
  // Persistent Data States (using useLocalStorage hook)
  const [members, setMembers] = useLocalStorage<FamilyMember[]>('finfam_members', INITIAL_MEMBERS);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('finfam_transactions', INITIAL_TRANSACTIONS);
  const [bills, setBills] = useLocalStorage<Bill[]>('finfam_bills', INITIAL_BILLS);
  const [savingsGoal, setSavingsGoal] = useLocalStorage<SavingsGoal>('finfam_goal', INITIAL_GOAL);
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>('finfam_achievements', INITIAL_ACHIEVEMENTS);
  const [cards, setCards] = useLocalStorage<CreditCard[]>('finfam_cards', INITIAL_CARDS);
  const [chatHistory, setChatHistory] = useLocalStorage<ChatMessage[]>('finfam_chat', [
    {
      id: 'welcome',
      text: 'Olá! Sou a Inteligência Artificial da FinFam. Posso ajudar a analisar o orçamento da sua família, verificar o teto de gastos de cada um ou dar dicas para a meta de viagem. Pergunte-me qualquer coisa!',
      sender: 'ai',
      timestamp: 'Agora'
    }
  ]);
  
  // UI State
  const [showNewTransactionForm, setShowNewTransactionForm] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Sync Supabase authenticated profile if active
  useEffect(() => {
    if (supabaseProfile) {
      setCurrentUser(supabaseProfile);
      localStorage.setItem('finfam_current_user', JSON.stringify(supabaseProfile));
      setMembers(prev => {
        const exists = prev.some(m => m.id === supabaseProfile.id);
        if (!exists) return [supabaseProfile, ...prev];
        return prev.map(m => m.id === supabaseProfile.id ? supabaseProfile : m);
      });
    }
  }, [supabaseProfile]);

  // Auth initialization from localStorage fallback
  useEffect(() => {
    if (!supabaseLoading) {
      const savedUser = localStorage.getItem('finfam_current_user');
      if (savedUser && !currentUser) {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
      }
      setAuthInitialized(true);
    }
  }, [supabaseLoading]);

  const currentMemberId = currentUser?.id || members[0]?.id || 'ricardo';
  const currentMember = members.find(m => m.id === currentMemberId) || members[0];

  // Auth Operations
  const handleLogin = (member: FamilyMember) => {
    setCurrentUser(member);
    localStorage.setItem('finfam_current_user', JSON.stringify(member));

    // Automatically sync members state to include this user if they are not present
    setMembers(prev => {
      const exists = prev.some(m => m.id === member.id);
      if (!exists) {
        return [...prev, member];
      }
      return prev;
    });
  };

  const handleRegister = (newMemberData: Omit<FamilyMember, 'id' | 'currentSpending' | 'points' | 'limitStatus'> & { password?: string }) => {
    const newId = 'm-' + Math.random().toString(36).substring(2, 9);
    const newMember: FamilyMember = {
      id: newId,
      name: newMemberData.name,
      role: newMemberData.role,
      spendingLimit: newMemberData.spendingLimit,
      currentSpending: 0,
      points: 100, // starting gift points
      avatarUrl: newMemberData.avatarUrl,
      limitStatus: 'Dentro do limite',
      email: newMemberData.email,
      password: newMemberData.password,
    };

    setMembers(prev => [...prev, newMember]);
  };

  const handleLogout = async () => {
    await supabaseSignOut();
    setCurrentUser(null);
    localStorage.removeItem('finfam_current_user');
  };

  const handleSelectMember = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      setCurrentUser(member);
      localStorage.setItem('finfam_current_user', JSON.stringify(member));
    }
  };

  // 1. CONFIRM AUTO DETECTED TRANSACTION
  const handleConfirmAutoTransaction = (id: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: 'confirmado' as const, date: 'Confirmado Agora' };
      }
      return t;
    }));

    // Find the confirmed item to adjust user spending & give points
    const confirmedTx = transactions.find(t => t.id === id);
    if (confirmedTx) {
      setMembers(prev => prev.map(m => {
        if (m.id === confirmedTx.memberId) {
          const newSpending = m.currentSpending + confirmedTx.value;
          return {
            ...m,
            currentSpending: newSpending,
            points: m.points + 50, // Reward confirmation
            limitStatus: newSpending > m.spendingLimit 
              ? 'Dentro do limite' /* limit next checks */ 
              : newSpending > m.spendingLimit * 0.85
              ? 'Limite próximo'
              : 'Dentro do limite'
          };
        }
        return m;
      }));
    }
  };

  // 2. MANUAL ADD TRANSACTION
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const transactionId = 't-' + (transactions.length + 1);
    const added: Transaction = {
      ...newTx,
      id: transactionId
    };

    setTransactions(prev => [added, ...prev]);

    // Update member's current spend and give points for manual entry
    setMembers(prev => prev.map(m => {
      if (m.id === newTx.memberId) {
        const newSpending = m.currentSpending + newTx.value;
        return {
          ...m,
          currentSpending: newSpending,
          points: m.points + 15, // manually logged reward
          limitStatus: newSpending > m.spendingLimit * 0.9
            ? 'Limite próximo'
            : m.limitStatus
        };
      }
      return m;
    }));
  };

  // 3. EDIT AUTOMATIC TRANSACTION BEFORE CONFIRMING
  const handleEditAutoTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (tx) {
      // Toggle form open, switch to transactions view
      setActiveTab('lancamentos');
      setShowNewTransactionForm(true);
      // Remove pending item
      setTransactions(prev => prev.filter(t => t.id !== id));
      alert(`Você escolheu ajustar o lançamento de R$ ${tx.value.toFixed(2)}. Modifique o formulário abaixo.`);
    }
  };

  // 4. TOGGLE FIXED BILL PAID STATE
  const handleToggleBillPaid = (id: string) => {
    let pointReward = 0;
    setBills(prev => prev.map(b => {
      if (b.id === id) {
        const nextStatus = b.status === 'pago' ? 'pendente' : 'pago';
        if (nextStatus === 'pago') pointReward = 100; // 100 pts for paying on time!
        return { ...b, status: nextStatus };
      }
      return b;
    }));

    if (pointReward > 0) {
      setMembers(prev => prev.map(m => {
        if (m.id === currentMemberId) {
          return { ...m, points: m.points + pointReward };
        }
        return m;
      }));
    }
  };

  // 5. UPDATE MEMBER TETO/LIMIT
  const handleUpdateMemberLimit = (id: string, newLimit: number) => {
    setMembers(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          spendingLimit: newLimit,
          limitStatus: m.currentSpending > newLimit * 0.9 ? 'Limite próximo' : 'Dentro do limite'
        };
      }
      return m;
    }));
  };

  // 6. CONTRIBUTING TO TRAVEL SAVINGS GOAL
  const handleAddContribution = (amount: number, memberId: string) => {
    setSavingsGoal(prev => {
      const currentCont = prev.memberContributions[memberId] || 0;
      return {
        ...prev,
        currentAmount: prev.currentAmount + amount,
        memberContributions: {
          ...prev.memberContributions,
          [memberId]: currentCont + amount
        }
      };
    });

    // Reward points for saving toward collective goals
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return { ...m, points: m.points + 120 };
      }
      return m;
    }));
  };

  // 7. CARD REGISTRATION AND REMOVAL SYSTEM
  const handleAddCard = (newCard: Omit<CreditCard, 'id'>) => {
    const cardId = 'c-' + (cards.length + 1);
    setCards(prev => [...prev, { ...newCard, id: cardId }]);
  };

  const handleDeleteCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  // 8. INTERACTIVE AI CHATBOT SYSTEM
  const handleSendMessage = async (text: string) => {
    const timestampStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: 'msg-' + (chatHistory.length + 1),
      text,
      sender: 'user',
      timestamp: timestampStr
    };

    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setIsAiLoading(true);

    try {
      const financialContext = {
        members,
        transactions,
        bills,
        savingsGoal,
        cards
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: text,
          chatHistory: updatedHistory,
          financialContext
        })
      });

      if (!response.ok) {
        throw new Error("Erro na resposta do servidor");
      }

      const data = await response.json();
      
      const aiMsg: ChatMessage = {
        id: 'msg-' + (updatedHistory.length + 1),
        text: data.reply,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory(prev => [...prev, aiMsg]);
    } catch (error: any) {
      console.error("Erro ao enviar mensagem para IA:", error);
      const errorMsg: ChatMessage = {
        id: 'msg-error-' + Date.now(),
        text: "Desculpe, estou com dificuldades para me conectar ao servidor agora. Por favor, verifique se a API Key do Gemini está configurada corretamente nos Ajustes do app.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Count pending items for notifications
  const pendingNotificationCount = transactions.filter(t => t.status === 'pendente_confirmacao').length;

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setShowNewTransactionForm(false);
  };

  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Spinner />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <LoginScreen
        members={members}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-[#030712] text-slate-100 relative overflow-x-hidden">
      <BackgroundGlow />

      {/* Dynamic Header */}
      <div className="relative z-10">
        <Header
          currentMember={currentMember}
          members={members}
          onSelectMember={handleSelectMember}
          onOpenNotifications={() => {
            setActiveTab('lancamentos');
            alert('Aqui estão suas notificações de lançamentos detectados de forma automatizada por conexões bancárias e SMS.');
          }}
          notificationCount={pendingNotificationCount}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Canvas Area */}
      <main className="flex-grow p-4 md:px-8 md:py-6 max-w-4xl mx-auto w-full relative z-10">
        {activeTab === 'dashboard' && (
          <DashboardTab
            transactions={transactions}
            members={members}
            onNavigateToTab={(tabId) => setActiveTab(tabId as any)}
            onOpenNewTransactionModal={() => {
              setActiveTab('lancamentos');
              setShowNewTransactionForm(true);
            }}
          />
        )}

        {activeTab === 'lancamentos' && (
          <TransactionsTab
            transactions={transactions}
            members={members}
            currentMember={currentMember}
            onConfirmAutoTransaction={handleConfirmAutoTransaction}
            onAddTransaction={handleAddTransaction}
            onEditAutoTransaction={handleEditAutoTransaction}
            showNewTransactionForm={showNewTransactionForm}
            onToggleNewTransactionForm={setShowNewTransactionForm}
          />
        )}

        {activeTab === 'contas' && (
          <BillsTab
            bills={bills}
            onToggleBillPaid={handleToggleBillPaid}
            onAddBill={(newBill) => {
              const newId = 'b-' + (bills.length + 1);
              setBills(prev => [...prev, { ...newBill, id: newId }]);
            }}
          />
        )}

        {activeTab === 'familia' && (
          <FamilyTab
            members={members}
            savingsGoal={savingsGoal}
            achievements={achievements}
            onUpdateMemberLimit={handleUpdateMemberLimit}
            onAddContribution={handleAddContribution}
          />
        )}

        {activeTab === 'ia' && (
          <AITab
            transactions={transactions}
            members={members}
            onAddTransaction={handleAddTransaction}
            chatHistory={chatHistory}
            onSendMessage={handleSendMessage}
            isAILoading={isAiLoading}
          />
        )}

        {activeTab === 'configuracoes' && (
          <SettingsTab
            cards={cards}
            onAddCard={handleAddCard}
            onDeleteCard={handleDeleteCard}
            members={members}
          />
        )}
      </main>

      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        pendingNotificationCount={pendingNotificationCount}
      />
    </div>
  );
}
