import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import { createAIService } from "@/lib/ai-service"
import type { CreateSummaryRequest } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body: CreateSummaryRequest = await request.json()
    console.log("Received summary request:", body)

    if (!body.transcriptId || !body.instruction) {
      return NextResponse.json({ error: "Transcript ID and instruction are required" }, { status: 400 })
    }

    // Debug storage state
    const storageStats = storage.getStats()
    console.log("Storage stats before transcript lookup:", storageStats)

    // Get the transcript
    const transcript = await storage.getTranscript(body.transcriptId)
    if (!transcript) {
      console.error("Transcript not found:", body.transcriptId)
      console.error("Available transcript IDs:", storageStats.transcriptIds)
      return NextResponse.json({
        error: "Transcript not found",
        transcriptId: body.transcriptId,
        availableTranscripts: storageStats.transcriptIds,
        storageStats
      }, { status: 404 })
    }
    console.log("Found transcript:", transcript.id)

    // Handle prompt ID - if not provided or custom, create a new prompt
    let promptId = body.promptId
    if (!promptId || promptId === "custom") {
      try {
        console.log("Creating custom prompt with instruction:", body.instruction)
        const prompt = await storage.createPrompt({
          title: "Custom Prompt",
          instruction: body.instruction,
        })
        promptId = prompt.id
        console.log("Created prompt:", prompt.id)
      } catch (error) {
        console.error("Failed to create prompt:", error)
        return NextResponse.json({ error: "Failed to create prompt" }, { status: 500 })
      }
    } else {
      console.log("Using existing prompt:", promptId)
    }

    // Generate AI summary
    console.log("Generating AI summary...")
    const aiService = createAIService()
    const aiSummary = await aiService.generateSummary(transcript.content, body.instruction)
    console.log("AI summary generated, length:", aiSummary.length)

    // Save the summary
    console.log("Saving summary to storage...")
    const summary = await storage.createSummary({
      transcriptId: body.transcriptId,
      promptId: promptId,
      originalSummary: aiSummary,
    })
    console.log("Summary saved:", summary.id)

    return NextResponse.json(summary, { status: 201 })
  } catch (error) {
    console.error("Summary generation error:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transcriptId = searchParams.get("transcriptId")

    if (transcriptId) {
      const summaries = await storage.getSummariesByTranscript(transcriptId)
      return NextResponse.json(summaries)
    }

    return NextResponse.json({ error: "Transcript ID is required" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch summaries" }, { status: 500 })
  }
}
