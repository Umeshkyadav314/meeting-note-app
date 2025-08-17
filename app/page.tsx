"use client"

import { useState } from "react"
import { FileUpload } from "@/components/file-upload"
import { PromptSelector } from "@/components/prompt-selector"
import { SummaryEditor } from "@/components/summary-editor"
import { EmailShare } from "@/components/email-share"
import { useToast } from "@/hooks/use-toast"

type Step = "upload" | "prompt" | "summary" | "share"

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<Step>("upload")
  const [uploadedTranscript, setUploadedTranscript] = useState<{ id: string; title: string } | null>(null)
  const [generatedSummary, setGeneratedSummary] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleFileUpload = async (file: File, title: string) => {
    setIsLoading(true)
    try {
      const content = await file.text()

      console.log("[Frontend] Uploading file:", title)
      const response = await fetch("/api/transcripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      })

      if (response.ok) {
        const transcript = await response.json()
        console.log("[Frontend] Transcript created:", transcript.id)
        setUploadedTranscript({ id: transcript.id, title: transcript.title })
        setCurrentStep("prompt")
        toast({
          title: "File uploaded successfully",
          description: "Your transcript is ready for summarization.",
        })
      } else {
        throw new Error("Failed to upload transcript")
      }
    } catch (error) {
      console.error("[Frontend] Upload error:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePromptSubmit = async (promptId: string, customInstruction?: string) => {
    if (!uploadedTranscript) return

    console.log("[Frontend] Submitting prompt for transcript:", uploadedTranscript.id)
    setIsLoading(true)
    try {
      const response = await fetch("/api/summaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcriptId: uploadedTranscript.id,
          promptId: promptId,
          instruction:
            customInstruction || "Summarize this meeting transcript into key points, decisions made, and action items.",
        }),
      })

      if (response.ok) {
        const summary = await response.json()
        console.log("[Frontend] Summary generated:", summary.id)
        setGeneratedSummary(summary)
        setCurrentStep("summary")
        toast({
          title: "Summary generated successfully",
          description: "Your AI-powered meeting summary is ready for review.",
        })
      } else {
        const errorData = await response.json()
        console.error("[Frontend] Summary generation failed:", errorData)
        throw new Error("Failed to generate summary")
      }
    } catch (error) {
      console.error("[Frontend] Summary error:", error)
      toast({
        title: "Summarization failed",
        description: "There was an error generating your summary. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSummarySave = async (editedSummary: string) => {
    if (!generatedSummary) return

    const response = await fetch(`/api/summaries/${generatedSummary.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ editedSummary }),
    })

    if (response.ok) {
      const updatedSummary = await response.json()
      setGeneratedSummary(updatedSummary)
    } else {
      throw new Error("Failed to save summary")
    }
  }

  const handleShare = () => {
    setCurrentStep("share")
  }

  const handleEmailComplete = () => {
    // Reset the application state for a new session
    setCurrentStep("upload")
    setUploadedTranscript(null)
    setGeneratedSummary(null)
    toast({
      title: "Session complete",
      description: "Ready to process another meeting transcript.",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-4">AI Meeting Notes Summarizer</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your meeting transcripts into actionable summaries with the power of AI. Upload, customize, and
            share your insights effortlessly.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center space-x-2 ${currentStep === "upload" ? "text-primary" : (currentStep === "prompt" || currentStep === "summary" || currentStep === "share") ? "text-accent" : "text-muted-foreground"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === "upload" ? "bg-primary text-primary-foreground" : (currentStep === "prompt" || currentStep === "summary" || currentStep === "share") ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}
              >
                1
              </div>
              <span className="font-medium">Upload</span>
            </div>
            <div
              className={`w-8 h-px ${currentStep === "prompt" || currentStep === "summary" || currentStep === "share" ? "bg-accent" : "bg-border"}`}
            />
            <div
              className={`flex items-center space-x-2 ${currentStep === "prompt" ? "text-primary" : (currentStep === "summary" || currentStep === "share") ? "text-accent" : "text-muted-foreground"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === "prompt" ? "bg-primary text-primary-foreground" : (currentStep === "summary" || currentStep === "share") ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}
              >
                2
              </div>
              <span className="font-medium">Customize</span>
            </div>
            <div
              className={`w-8 h-px ${currentStep === "summary" || currentStep === "share" ? "bg-accent" : "bg-border"}`}
            />
            <div
              className={`flex items-center space-x-2 ${currentStep === "summary" ? "text-primary" : currentStep === "share" ? "text-accent" : "text-muted-foreground"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === "summary" ? "bg-primary text-primary-foreground" : currentStep === "share" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}
              >
                3
              </div>
              <span className="font-medium">Review & Edit</span>
            </div>
            <div className={`w-8 h-px ${currentStep === "share" ? "bg-accent" : "bg-border"}`} />
            <div
              className={`flex items-center space-x-2 ${currentStep === "share" ? "text-primary" : "text-muted-foreground"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === "share" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                4
              </div>
              <span className="font-medium">Share</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {currentStep === "upload" && <FileUpload onFileSelect={handleFileUpload} isLoading={isLoading} />}

          {currentStep === "prompt" && <PromptSelector onSubmit={handlePromptSubmit} isLoading={isLoading} />}

          {currentStep === "summary" && generatedSummary && uploadedTranscript && (
            <SummaryEditor
              summary={generatedSummary}
              transcriptTitle={uploadedTranscript.title}
              onSave={handleSummarySave}
              onShare={handleShare}
              isLoading={isLoading}
            />
          )}

          {currentStep === "share" && generatedSummary && uploadedTranscript && (
            <EmailShare
              summary={generatedSummary}
              transcriptTitle={uploadedTranscript.title}
              onComplete={handleEmailComplete}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  )
}
