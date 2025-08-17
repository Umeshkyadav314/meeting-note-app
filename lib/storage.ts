import type { MeetingTranscript, SummaryPrompt, GeneratedSummary, EmailShare } from "./types"

// Global storage reference to ensure persistence across module reloads
let globalStorage: InMemoryStorage | null = null

// In-memory storage (replace with MongoDB when integration is added)
class InMemoryStorage {
  private static instance: InMemoryStorage
  private transcripts: Map<string, MeetingTranscript> = new Map()
  private prompts: Map<string, SummaryPrompt> = new Map()
  private summaries: Map<string, GeneratedSummary> = new Map()
  private emailShares: Map<string, EmailShare> = new Map()

  private constructor() {
    console.log("InMemoryStorage instance created")
    this.initializeDefaultPrompts()

    // Try to restore data from global scope if available
    if (typeof global !== 'undefined' && (global as any).__MEETING_NOTES_STORAGE__) {
      const savedData = (global as any).__MEETING_NOTES_STORAGE__
      this.transcripts = new Map(savedData.transcripts || [])
      this.prompts = new Map(savedData.prompts || [])
      this.summaries = new Map(savedData.summaries || [])
      this.emailShares = new Map(savedData.emailShares || [])
      console.log("[Storage] Restored data from global scope, transcripts:", this.transcripts.size)
    }
  }

  public static getInstance(): InMemoryStorage {
    // Use global storage if available
    if (globalStorage) {
      console.log("[Storage] Using global storage instance")
      return globalStorage
    }

    if (!InMemoryStorage.instance) {
      console.log("[Storage] Creating new InMemoryStorage instance")
      InMemoryStorage.instance = new InMemoryStorage()
      globalStorage = InMemoryStorage.instance
    } else {
      console.log("[Storage] Using existing InMemoryStorage instance")
      globalStorage = InMemoryStorage.instance
    }
    console.log("[Storage] Instance address:", InMemoryStorage.instance)
    return InMemoryStorage.instance
  }

  private async initializeDefaultPrompts() {
    try {
      // Initialize default prompts
      const defaultPrompts: Omit<SummaryPrompt, "id" | "createdAt">[] = [
        {
          title: "Meeting Summary",
          instruction: "Summarize this meeting transcript into key points, decisions made, and action items.",
          userId: "system",
        },
        {
          title: "Action Items Only",
          instruction: "Extract only the action items and tasks assigned from this meeting transcript.",
          userId: "system",
        },
        {
          title: "Key Decisions",
          instruction: "Identify and summarize the key decisions made during this meeting.",
          userId: "system",
        },
        {
          title: "Executive Summary",
          instruction: "Create a brief executive summary of this meeting suitable for leadership review.",
          userId: "system",
        },
      ]

      for (const prompt of defaultPrompts) {
        await this.createPrompt(prompt)
      }
      console.log("Default prompts initialized")
    } catch (error) {
      console.error("Failed to initialize default prompts:", error)
    }
  }

  // Transcript operations
  async createTranscript(data: Omit<MeetingTranscript, "id" | "uploadedAt">): Promise<MeetingTranscript> {
    const transcript: MeetingTranscript = {
      id: crypto.randomUUID(),
      uploadedAt: new Date(),
      ...data,
    }
    this.transcripts.set(transcript.id, transcript)
    this.persistToGlobal()
    console.log(`[Storage ${this.constructor.name}] Created transcript: ${transcript.id}, total transcripts: ${this.transcripts.size}`)
    console.log(`[Storage ${this.constructor.name}] All transcript IDs:`, Array.from(this.transcripts.keys()))
    console.log(`[Storage ${this.constructor.name}] Storage instance ID:`, this.constructor.name)
    return transcript
  }

  async getTranscript(id: string): Promise<MeetingTranscript | null> {
    const transcript = this.transcripts.get(id) || null
    console.log(`[Storage ${this.constructor.name}] Looking for transcript: ${id}, found: ${transcript ? 'yes' : 'no'}, total transcripts: ${this.transcripts.size}`)
    console.log(`[Storage ${this.constructor.name}] All transcript IDs:`, Array.from(this.transcripts.keys()))
    console.log(`[Storage ${this.constructor.name}] Storage instance ID:`, this.constructor.name)
    return transcript
  }

  async getAllTranscripts(): Promise<MeetingTranscript[]> {
    return Array.from(this.transcripts.values())
  }

  // Prompt operations
  async createPrompt(data: Omit<SummaryPrompt, "id" | "createdAt">): Promise<SummaryPrompt> {
    const prompt: SummaryPrompt = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      ...data,
    }
    this.prompts.set(prompt.id, prompt)
    this.persistToGlobal()
    return prompt
  }

  async getPrompt(id: string): Promise<SummaryPrompt | null> {
    return this.prompts.get(id) || null
  }

  async getAllPrompts(): Promise<SummaryPrompt[]> {
    return Array.from(this.prompts.values())
  }

  // Summary operations
  async createSummary(data: Omit<GeneratedSummary, "id" | "createdAt">): Promise<GeneratedSummary> {
    const summary: GeneratedSummary = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      ...data,
    }
    this.summaries.set(summary.id, summary)
    this.persistToGlobal()
    return summary
  }

  async getSummary(id: string): Promise<GeneratedSummary | null> {
    return this.summaries.get(id) || null
  }

  async updateSummary(id: string, data: Partial<GeneratedSummary>): Promise<GeneratedSummary | null> {
    const existing = this.summaries.get(id)
    if (!existing) return null

    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    }
    this.summaries.set(id, updated)
    return updated
  }

  async getSummariesByTranscript(transcriptId: string): Promise<GeneratedSummary[]> {
    return Array.from(this.summaries.values()).filter((s) => s.transcriptId === transcriptId)
  }

  // Email share operations
  async createEmailShare(data: Omit<EmailShare, "id" | "sentAt">): Promise<EmailShare> {
    const emailShare: EmailShare = {
      id: crypto.randomUUID(),
      sentAt: new Date(),
      ...data,
    }
    this.emailShares.set(emailShare.id, emailShare)
    return emailShare
  }

  // Method to get storage stats for debugging
  public getStats() {
    return {
      transcripts: this.transcripts.size,
      prompts: this.prompts.size,
      summaries: this.summaries.size,
      emailShares: this.emailShares.size,
      transcriptIds: Array.from(this.transcripts.keys()),
      promptIds: Array.from(this.prompts.keys()),
    }
  }

  // Method to manually set storage data (for debugging)
  public setDebugData(data: any) {
    if (data.transcripts) {
      this.transcripts = new Map(data.transcripts)
    }
    if (data.prompts) {
      this.prompts = new Map(data.prompts)
    }
    if (data.summaries) {
      this.summaries = new Map(data.summaries)
    }
    console.log("[Storage] Debug data set, transcripts:", this.transcripts.size)
  }

  // Method to persist data to global scope
  private persistToGlobal() {
    if (typeof global !== 'undefined') {
      (global as any).__MEETING_NOTES_STORAGE__ = {
        transcripts: Array.from(this.transcripts.entries()),
        prompts: Array.from(this.prompts.entries()),
        summaries: Array.from(this.summaries.entries()),
        emailShares: Array.from(this.emailShares.entries()),
      }
      console.log("[Storage] Data persisted to global scope")
    }
  }
}

export const storage = InMemoryStorage.getInstance()

// Add a check to see if this module is being imported multiple times
console.log("[Storage Module] Storage module loaded, instance:", storage)
console.log("[Storage Module] Module ID:", module.id || 'unknown')
