"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2 } from "lucide-react"
import type { SummaryPrompt } from "@/lib/types"

interface PromptSelectorProps {
  onSubmit: (promptId: string, customInstruction?: string) => void
  isLoading?: boolean
}

export function PromptSelector({ onSubmit, isLoading }: PromptSelectorProps) {
  const [prompts, setPrompts] = useState<SummaryPrompt[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<string>("")
  const [customInstruction, setCustomInstruction] = useState("")
  const [loadingPrompts, setLoadingPrompts] = useState(true)

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await fetch("/api/prompts")
        if (response.ok) {
          const data = await response.json()
          setPrompts(data)
          if (data.length > 0) {
            setSelectedPrompt(data[0].id)
          }
        }
      } catch (error) {
        console.error("Failed to fetch prompts:", error)
      } finally {
        setLoadingPrompts(false)
      }
    }

    fetchPrompts()
  }, [])

  const handleSubmit = () => {
    if (selectedPrompt) {
      const isCustom = selectedPrompt === "custom"
      onSubmit(isCustom ? "custom" : selectedPrompt, isCustom ? customInstruction : undefined)
    }
  }

  if (loadingPrompts) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading summarization options...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-serif">Choose Summarization Style</CardTitle>
        <p className="text-muted-foreground">Select how you'd like your meeting transcript to be summarized.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={selectedPrompt} onValueChange={setSelectedPrompt}>
          {prompts.map((prompt) => (
            <div key={prompt.id} className="flex items-start space-x-3">
              <RadioGroupItem value={prompt.id} id={prompt.id} className="mt-1" />
              <div className="flex-1">
                <Label htmlFor={prompt.id} className="font-medium cursor-pointer">
                  {prompt.title}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{prompt.instruction}</p>
              </div>
            </div>
          ))}
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="custom" id="custom" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="custom" className="font-medium cursor-pointer">
                Custom Instructions
              </Label>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                Provide your own specific instructions for summarization.
              </p>
              {selectedPrompt === "custom" && (
                <Textarea
                  placeholder="Enter your custom summarization instructions..."
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  className="min-h-[100px]"
                  disabled={isLoading}
                />
              )}
            </div>
          </div>
        </RadioGroup>

        <Button
          onClick={handleSubmit}
          disabled={!selectedPrompt || (selectedPrompt === "custom" && !customInstruction.trim()) || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Summary...
            </>
          ) : (
            "Generate AI Summary"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
