"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Mail, Send, Plus, X, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { GeneratedSummary } from "@/lib/types"

interface EmailShareProps {
  summary: GeneratedSummary
  transcriptTitle: string
  onComplete: () => void
  isLoading?: boolean
}

export function EmailShare({ summary, transcriptTitle, onComplete, isLoading }: EmailShareProps) {
  const [recipients, setRecipients] = useState<string[]>([])
  const [currentEmail, setCurrentEmail] = useState("")
  const [senderName, setSenderName] = useState("")
  const [customMessage, setCustomMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { toast } = useToast()

  const addRecipient = () => {
    const email = currentEmail.trim().toLowerCase()
    if (email && isValidEmail(email) && !recipients.includes(email)) {
      setRecipients([...recipients, email])
      setCurrentEmail("")
    }
  }

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter((r) => r !== email))
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addRecipient()
    }
  }

  const handleSend = async () => {
    if (recipients.length === 0) {
      toast({
        title: "No recipients",
        description: "Please add at least one email recipient.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      const response = await fetch("/api/email/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summaryId: summary.id,
          recipients,
          senderName: senderName.trim() || "Meeting Organizer",
          customMessage: customMessage.trim(),
          transcriptTitle,
        }),
      })

      if (response.ok) {
        setEmailSent(true)
        toast({
          title: "Summary shared successfully",
          description: `Your meeting summary has been sent to ${recipients.length} recipient${recipients.length > 1 ? "s" : ""}.`,
        })
      } else {
        throw new Error("Failed to send email")
      }
    } catch (error) {
      toast({
        title: "Failed to send",
        description: "There was an error sending your summary. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  if (emailSent) {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold mb-2">Summary Shared Successfully!</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your meeting summary has been sent to {recipients.length} recipient{recipients.length > 1 ? "s" : ""}. They
            will receive it shortly.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Sent to:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {recipients.map((email) => (
              <Badge key={email} variant="secondary">
                {email}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Process Another Meeting
          </Button>
          <Button onClick={onComplete}>Done</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-bold mb-2">Share Your Summary</h2>
        <p className="text-muted-foreground">Send your meeting summary to team members via email.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sender-name">Your Name (Optional)</Label>
            <Input
              id="sender-name"
              placeholder="e.g., John Smith"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              disabled={isSending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipients">Recipients</Label>
            <div className="flex gap-2">
              <Input
                id="recipients"
                type="email"
                placeholder="Enter email address"
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSending}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addRecipient}
                disabled={!currentEmail.trim() || !isValidEmail(currentEmail.trim()) || isSending}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {recipients.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {recipients.map((email) => (
                  <Badge key={email} variant="secondary" className="flex items-center gap-1">
                    {email}
                    <button
                      onClick={() => removeRecipient(email)}
                      className="ml-1 hover:text-destructive"
                      disabled={isSending}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-message">Custom Message (Optional)</Label>
            <Textarea
              id="custom-message"
              placeholder="Add a personal message to include with the summary..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="min-h-[100px]"
              disabled={isSending}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Meeting:</span>
              <span className="text-sm text-muted-foreground">{transcriptTitle}</span>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 max-h-48 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {summary.editedSummary || summary.originalSummary}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button variant="outline" size="lg" onClick={() => window.history.back()} disabled={isSending}>
          Back to Edit
        </Button>
        <Button
          size="lg"
          onClick={handleSend}
          disabled={recipients.length === 0 || isSending}
          className="min-w-[140px]"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSending
            ? "Sending..."
            : `Send to ${recipients.length || 0} recipient${recipients.length !== 1 ? "s" : ""}`}
        </Button>
      </div>
    </div>
  )
}
