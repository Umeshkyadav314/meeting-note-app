import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const transcript = await storage.getTranscript(params.id)

    if (!transcript) {
      return NextResponse.json({ error: "Transcript not found" }, { status: 404 })
    }

    return NextResponse.json(transcript)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch transcript" }, { status: 500 })
  }
}
