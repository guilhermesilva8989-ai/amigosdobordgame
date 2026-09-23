export type TransactionType = 'ENTRY' | 'EXPENSE';
export type ParticipantStatus = 'PAID' | 'PENDING';

export interface DashboardSummary {
  totalEntries: number;
  totalExpenses: number;
  balance: number;
  activeParticipants: number;
  paidParticipants: number;
}

export interface DashboardGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  percentage: number;
  deadline: string | null;
}

export interface DashboardParticipant {
  publicCode: string;
  alias: string;
  joinedAt: string;
  paid: number;
  status: ParticipantStatus;
}

export interface DashboardTransaction {
  id: string;
  type: TransactionType;
  amount: string;
  description: string;
  occurredAt: string;
  participantCode: string | null;
}

export interface DashboardSettings {
  heroTitle: string;
  heroDescription: string;
  bannerUrl: string;
  showGoal: boolean;
  nameDisplayMode: 'FANTASY' | 'REAL';
}

export interface DashboardResponse {
  settings: DashboardSettings;
  generatedAt: string;
  referenceMonth: string;
  summary: DashboardSummary;
  goal: DashboardGoal | null;
  participants: DashboardParticipant[];
  recentTransactions: DashboardTransaction[];
}
