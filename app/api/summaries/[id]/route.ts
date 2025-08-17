import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import type { UpdateSummaryRequest } from "@/lib/types"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const summary = await storage.getSummary(params.id)

    if (!summary) {
      return NextResponse.json({ error: "Summary not found" }, { status: 404 })
    }

    return NextResponse.json(summary)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body: UpdateSummaryRequest = await request.json()

    if (!body.editedSummary) {
      return NextResponse.json({ error: "Edited summary is required" }, { status: 400 })
    }

    const updatedSummary = await storage.updateSummary(params.id, {
      editedSummary: body.editedSummary,
    })

    if (!updatedSummary) {
      return NextResponse.json({ error: "Summary not found" }, { status: 404 })
    }

    return NextResponse.json(updatedSummary)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update summary" }, { status: 500 })
  }
}
