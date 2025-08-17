import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import type { CreateTranscriptRequest } from "@/lib/types"

export async function GET() {
  try {
    const transcripts = await storage.getAllTranscripts()
    return NextResponse.json(transcripts)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch transcripts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTranscriptRequest = await request.json()
    console.log("[Transcript API] Received request:", body)

    if (!body.title || !body.content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    console.log("[Transcript API] Creating transcript...")
    const transcript = await storage.createTranscript(body)
    console.log("[Transcript API] Transcript created:", transcript.id)

    // Verify the transcript was stored
    const storedTranscript = await storage.getTranscript(transcript.id)
    console.log("[Transcript API] Verification - stored transcript found:", storedTranscript ? 'yes' : 'no')

    return NextResponse.json(transcript, { status: 201 })
  } catch (error) {
    console.error("[Transcript API] Error:", error)
    return NextResponse.json({ error: "Failed to create transcript" }, { status: 500 })
  }
}
