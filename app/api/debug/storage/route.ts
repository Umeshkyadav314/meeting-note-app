import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET() {
    try {
        const stats = storage.getStats()
        return NextResponse.json({
            message: "Storage debug info",
            stats,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        return NextResponse.json({ error: "Failed to get storage stats" }, { status: 500 })
    }
}
