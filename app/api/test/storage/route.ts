import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET() {
    try {
        // Create a test transcript
        const testTranscript = await storage.createTranscript({
            title: "Test Transcript",
            content: "This is a test transcript for debugging storage issues.",
        })

        // Try to retrieve it
        const retrievedTranscript = await storage.getTranscript(testTranscript.id)

        const stats = storage.getStats()

        return NextResponse.json({
            message: "Storage test completed",
            testTranscript: {
                created: testTranscript.id,
                retrieved: retrievedTranscript ? retrievedTranscript.id : null,
                found: !!retrievedTranscript,
            },
            stats,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        return NextResponse.json({ error: "Storage test failed", details: error }, { status: 500 })
    }
}
