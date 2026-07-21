export type CategoryType = 'Moradia' | 'Alimentação' | 'Lazer' | 'Assinaturas' | 'Transporte' | 'Outros';
export type CardType = 'Nubank' | 'Inter' | 'Outros' | string;

export interface Transaction {
  id: string;
  description: string;
  value: number;
  date: string; // e.g., "Hoje, 14:20" or "12 Ago"
  category: CategoryType;
  card: string;
  memberId: string;
  status: 'confirmado' | 'pendente_confirmacao';
  isOverBudget?: boolean;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  usedLimit: number;
  closingDay: number;
  dueDay: number;
  brand: 'Visa' | 'Mastercard' | 'Elo' | 'Amex' | 'Outros';
  color: 'purple' | 'orange' | 'blue' | 'emerald' | 'rose' | 'dark';
}

export interface Bill {
  id: string;
  description: string;
  value: number;
  dueDate: string; // e.g., "Dia 05" or "Hoje" or "Dia 12"
  icon: string; // material symbols icon name
  status: 'pago' | 'pendente' | 'proximo_vencimento';
  notificationEnabled: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  spendingLimit: number;
  currentSpending: number;
  points: number;
  avatarUrl: string;
  limitStatus: 'Dentro do limite' | 'Limite próximo' | 'Excelente!';
  email?: string;
  password?: string;
  isGoogleUser?: boolean;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  imageUrl: string;
  memberContributions: { [memberId: string]: number };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  colorClass: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}
