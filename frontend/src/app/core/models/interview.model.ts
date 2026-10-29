export interface Interview {
  id: number;
  jobApplicationId: number;
  companyName: string;
  jobTitle: string;
  round: string;
  type: string;
  scheduledAt: string;
  meetingUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isUpcoming: boolean;
}

export interface CreateInterviewRequest {
  jobApplicationId: number;
  round: string;
  type: string;
  scheduledAt: string;
  meetingUrl?: string;
  notes?: string;
}

export interface UpdateInterviewRequest {
  round: string;
  type: string;
  scheduledAt: string;
  meetingUrl?: string;
  notes?: string;
}
