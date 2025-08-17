import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET() {
  try {
    const prompts = await storage.getAllPrompts()
    return NextResponse.json(prompts)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.title || !body.instruction) {
      return NextResponse.json({ error: "Title and instruction are required" }, { status: 400 })
    }

    const prompt = await storage.createPrompt(body)
    return NextResponse.json(prompt, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create prompt" }, { status: 500 })
  }
}
