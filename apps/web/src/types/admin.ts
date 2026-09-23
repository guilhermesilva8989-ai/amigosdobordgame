export interface AdminParticipant {
  id: string;
  publicCode: string;
  name: string;
  isActive: boolean;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateParticipantInput {
  name: string;
}

export interface UpdateParticipantInput {
  name?: string;
  isActive?: boolean;
}

export type TransactionType = 'ENTRY' | 'EXPENSE';

export interface AdminTransactionParticipant {
  id: string;
  publicCode: string;
  name: string;
}

export interface AdminTransaction {
  id: string;
  type: TransactionType;
  amount: string;
  description: string;
  referenceMonth: string | null;
  occurredAt: string;
  participantId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  participant: AdminTransactionParticipant | null;
}

export interface CreateTransactionInput {
  type: TransactionType;
  amount: string;
  description: string;
  referenceMonth?: string;
  occurredAt?: string;
  participantId?: string;
}

export interface UpdateTransactionInput {
  amount?: string;
  description?: string;
}

export interface RemoveTransactionResponse {
  message: string;
  id: string;
}

export interface AdminFinancialGoal {
  id: string;
  title: string;
  targetAmount: string;
  deadline: string | null;
  isActive: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveFinancialGoalInput {
  title: string;
  targetAmount: string;
  deadline?: string;
}

export type NameDisplayMode = 'FANTASY' | 'REAL';

export interface AdminSiteSettings {
  id: string;
  heroTitle: string;
  heroDescription: string;
  bannerUrl: string;
  showGoal: boolean;
  nameDisplayMode: NameDisplayMode;
  createdAt: string;
  updatedAt: string;
}

export interface SaveSiteSettingsInput {
  heroTitle: string;
  heroDescription: string;
  bannerUrl: string;
  showGoal: boolean;
  nameDisplayMode: NameDisplayMode;
}
