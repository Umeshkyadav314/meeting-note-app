export interface MeetingTranscript {
  id: string
  title: string
  content: string
  uploadedAt: Date
  userId?: string
}

export interface SummaryPrompt {
  id: string
  title: string
  instruction: string
  createdAt: Date
  userId?: string
}

export interface GeneratedSummary {
  id: string
  transcriptId: string
  promptId: string
  originalSummary: string
  editedSummary?: string
  createdAt: Date
  updatedAt?: Date
  userId?: string
}

export interface EmailShare {
  id: string
  summaryId: string
  recipientEmail: string
  senderName?: string
  sentAt: Date
  userId?: string
}

export interface CreateTranscriptRequest {
  title: string
  content: string
}

export interface CreateSummaryRequest {
  transcriptId: string
  promptId: string
  instruction: string
}

export interface UpdateSummaryRequest {
  editedSummary: string
}

export interface ShareSummaryRequest {
  recipientEmail: string
  senderName?: string
}
