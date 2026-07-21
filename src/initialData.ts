import { Transaction, Bill, FamilyMember, SavingsGoal, Achievement } from './types';

export const INITIAL_MEMBERS: FamilyMember[] = [
  {
    id: 'ricardo',
    name: 'Ricardo (Pai)',
    role: 'Líder do Grupo',
    spendingLimit: 3000,
    currentSpending: 2450,
    points: 290,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzPEF20PQazID4Kst6h_LDU9NM9FJmMDfYF0c1DkyhdW-V8BC1UDop9J3wyGRZz0deiUgQMEEq9Tcn-JsKk4t-fTBqxhgTJ_arLgHMjBLi9VyL5QkWCrrPmXp-PmrZSOePVsffsoWfW8UL9l2sHjCQo0_pgly8-2OeccMpdwsq7ykLbqSH9L8SpCeU6XNk88bPhUbBbey1qtjkLIwS8gfaRrNWtCXmFYpeTSeIxPkqafLOQ9wDy08AKmEqN12JnvhUx4-k_G4ioZJD',
    limitStatus: 'Dentro do limite'
  },
  {
    id: 'helena',
    name: 'Helena (Mãe)',
    role: 'Estrategista',
    spendingLimit: 2500,
    currentSpending: 1820,
    points: 450,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfHkA5y8aXHhusH59UHBX6QToFoVLWXVkTN3XOvDnUfsdcJcfWdkNZxxjdj7bsIHxKQJ27R1YUyAwG-kz4ORj4VK0gfTGYub5AcMof53iXnxzZC1nogQH-vUFnFRWaWCvK-24LAP9Fpz-8H4KZyZqPUXT0XWuS4kwWoHSVnLwwuU0OdlA_6RRKPBQy02kXJlsult5Zo7QxWvoDacazhS17Y8G-A2b8eSmB7QIjfzQaoKcazFRmju7nZ_7zRKuq_2hi10Y2093_rBFm',
    limitStatus: 'Dentro do limite'
  },
  {
    id: 'lucas',
    name: 'Lucas',
    role: 'Aprendiz',
    spendingLimit: 1000,
    currentSpending: 950,
    points: 150,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArUjcR65AvAHBeDD14hDo5R9M9qalAUwc5wY3G-WJ6rYhH8Xfzdcbw_YZ9HNi79BFY1OrXMRXR9MTNp4BxwpxHPQchlsYha4nOdU-navTUJByN6ym5lqA19MFArNTG2wSNnezfB9F0CPgXyGZqDBQtySTXDltCaNTn2MPzAc3aj7V9cyVoJHk96ddRnO_rDevwuoEvEHoyAIRAbwxj3nVZNAftMzEsKpjycBAG1jJ0fOR74GtrvIMiTbJNmFWYap9Wx97ABPHQjqSG',
    limitStatus: 'Limite próximo'
  },
  {
    id: 'bia',
    name: 'Bia',
    role: 'Poupando muito!',
    spendingLimit: 500,
    currentSpending: 320,
    points: 380,
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdZHmtHfq4XcCllIiJAsZCHmPR_-aXcGBny0THvVCL1HaRVbRpJBVVwGOVESP5CyVMy68ChUW6euq3NFe02P6YVphojdoYi5IF5V9C4JMTgU_1h9wbvM0RAUf9g3vYyh-NG4OPw_Ljsm-3vjW4KcCHhd9BZqGp6Gr--spwkE1hIUX9ZOXk2o6h7YDXR1b7kBFGcgfZpj_TtOdjULbG2eSEQ_S1GylDB2Y2tv6qBe7gbKnVZ40zXe7Pdgs4fd5QV0Dd4YQwc3I7CemB',
    limitStatus: 'Excelente!'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't-1',
    description: 'Supermercado Pão de Açúcar',
    value: 452.10,
    date: 'Hoje, 14:20',
    category: 'Alimentação',
    card: 'Nubank',
    memberId: 'ricardo',
    status: 'confirmado'
  },
  {
    id: 't-2',
    description: 'Manutenção Carro',
    value: 1200.00,
    date: 'Ontem, 09:15',
    category: 'Transporte',
    card: 'Nubank',
    memberId: 'ricardo',
    status: 'confirmado',
    isOverBudget: true
  },
  {
    id: 't-3',
    description: 'Netflix',
    value: 55.90,
    date: '12 Ago',
    category: 'Assinaturas',
    card: 'Inter',
    memberId: 'helena',
    status: 'confirmado'
  },
  {
    id: 't-4',
    description: 'Starbucks',
    value: 18.50,
    date: '11 Ago',
    category: 'Lazer',
    card: 'Nubank',
    memberId: 'lucas',
    status: 'confirmado'
  },
  // Automatic pending ones
  {
    id: 'auto-1',
    description: 'Uber',
    value: 25.00,
    date: 'Via Notificação • Cartão Nubank',
    category: 'Transporte',
    card: 'Nubank',
    memberId: 'ricardo',
    status: 'pendente_confirmacao'
  },
  {
    id: 'auto-2',
    description: 'iFood Brasil',
    value: 84.90,
    date: 'Via Notificação • Cartão Inter',
    category: 'Alimentação',
    card: 'Inter',
    memberId: 'helena',
    status: 'pendente_confirmacao'
  }
];

export const INITIAL_BILLS: Bill[] = [
  {
    id: 'b-1',
    description: 'Aluguel',
    value: 1200.00,
    dueDate: 'Dia 05',
    icon: 'home',
    status: 'pago',
    notificationEnabled: true
  },
  {
    id: 'b-2',
    description: 'Energia Elétrica',
    value: 215.40,
    dueDate: 'Hoje',
    icon: 'electric_bolt',
    status: 'proximo_vencimento',
    notificationEnabled: true
  },
  {
    id: 'b-3',
    description: 'Internet Fibra',
    value: 119.90,
    dueDate: 'Dia 12',
    icon: 'wifi',
    status: 'pendente',
    notificationEnabled: false
  },
  {
    id: 'b-4',
    description: 'Condomínio',
    value: 450.00,
    dueDate: 'Dia 10',
    icon: 'apartment',
    status: 'pendente',
    notificationEnabled: true
  }
];

export const INITIAL_GOAL: SavingsGoal = {
  id: 'g-1',
  title: 'Disney & Orlando',
  targetAmount: 20000,
  currentAmount: 12450,
  imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAd9UMt_fWkxnt8Qr0ukbl1aFC6V7WDHhpkG4srqYHYxqkRk1AJtc-o-seNs87GJAIyxWhodLcTDwXQ06SsvoBVf-MFPSY_sGubEyz4DytIVXoVR26g2EGlUbchWvQv34Y4sRORx2wmiVf8HP-v2j4S95z5vR5XXdpwjLvnSvFDV2wc5x8C7f4egJbrimLIT_tJwhHt3hez1hTrHDmMsd-Iad7tANyFCht93Oux2mrHKTonPqT9wrbz8NeMqEMJDrjAUltgQQoVL2Zd',
  memberContributions: {
    ricardo: 4000,
    helena: 5500,
    lucas: 1200,
    bia: 1750
  }
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'a-1',
    title: 'Cofre Intacto',
    description: '30 dias sem usar a reserva de emergência.',
    icon: 'savings',
    isUnlocked: true,
    colorClass: 'bg-[#d6e3ff] text-[#031631]'
  },
  {
    id: 'a-2',
    title: 'Ecoeficientes',
    description: 'Redução de 15% na conta de luz este mês.',
    icon: 'eco',
    isUnlocked: true,
    colorClass: 'bg-[#6cf8bb] text-[#00714d]'
  },
  {
    id: 'a-3',
    title: 'Superavit Triplo',
    description: '3 meses seguidos de economia recorde.',
    icon: 'auto_awesome',
    isUnlocked: false,
    colorClass: 'bg-[#e0e3e5] text-[#44474d]'
  },
  {
    id: 'a-4',
    title: 'Sincronia Total',
    description: 'Todos os membros anotaram gastos diariamente.',
    icon: 'groups',
    isUnlocked: true,
    colorClass: 'bg-[#ffdbca] text-[#783200]'
  }
];
