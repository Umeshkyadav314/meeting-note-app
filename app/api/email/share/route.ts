import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"

interface EmailShareRequest {
  summaryId: string
  recipients: string[]
  senderName: string
  customMessage?: string
  transcriptTitle: string
}

// Email service abstraction (can be replaced with actual email service)
class EmailService {
  async sendSummaryEmail(
    recipients: string[],
    subject: string,
    content: string,
    senderName: string,
    customMessage?: string,
  ): Promise<void> {
    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // In a real implementation, you would use services like:
    // - Resend: https://resend.com/
    // - SendGrid: https://sendgrid.com/
    // - Nodemailer with SMTP
    // - AWS SES

    console.log("📧 Email would be sent with the following details:")
    console.log("To:", recipients.join(", "))
    console.log("Subject:", subject)
    console.log("From:", senderName)
    if (customMessage) {
      console.log("Custom Message:", customMessage)
    }
    console.log("Summary Content:", content.substring(0, 200) + "...")

    // For demo purposes, we'll just log and return success
    return Promise.resolve()
  }
}

const emailService = new EmailService()

export async function POST(request: NextRequest) {
  try {
    const body: EmailShareRequest = await request.json()

    if (!body.summaryId || !body.recipients || body.recipients.length === 0) {
      return NextResponse.json({ error: "Summary ID and recipients are required" }, { status: 400 })
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = body.recipients.filter((email) => !emailRegex.test(email))
    if (invalidEmails.length > 0) {
      return NextResponse.json({ error: `Invalid email addresses: ${invalidEmails.join(", ")}` }, { status: 400 })
    }

    // Get the summary
    const summary = await storage.getSummary(body.summaryId)
    if (!summary) {
      return NextResponse.json({ error: "Summary not found" }, { status: 404 })
    }

    // Prepare email content
    const subject = `Meeting Summary: ${body.transcriptTitle}`
    const summaryContent = summary.editedSummary || summary.originalSummary

    const emailContent = `
${body.customMessage ? `${body.customMessage}\n\n---\n\n` : ""}
Meeting: ${body.transcriptTitle}
Generated: ${new Date(summary.createdAt).toLocaleDateString()}

${summaryContent}

---
This summary was generated using AI Meeting Notes Summarizer.
    `.trim()

    // Send email
    await emailService.sendSummaryEmail(body.recipients, subject, emailContent, body.senderName, body.customMessage)

    // Record the email share
    for (const recipient of body.recipients) {
      await storage.createEmailShare({
        summaryId: body.summaryId,
        recipientEmail: recipient,
        senderName: body.senderName,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Summary sent to ${body.recipients.length} recipient${body.recipients.length > 1 ? "s" : ""}`,
    })
  } catch (error) {
    console.error("Email sharing error:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
