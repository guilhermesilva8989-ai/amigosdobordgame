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
