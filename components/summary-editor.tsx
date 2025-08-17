"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, RotateCcw, Share, FileText, Edit3, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { GeneratedSummary } from "@/lib/types"

interface SummaryEditorProps {
  summary: GeneratedSummary
  transcriptTitle: string
  onSave: (editedSummary: string) => void
  onShare: () => void
  isLoading?: boolean
}

export function SummaryEditor({ summary, transcriptTitle, onSave, onShare, isLoading }: SummaryEditorProps) {
  const [editedContent, setEditedContent] = useState(summary.editedSummary || summary.originalSummary)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const hasEdits = editedContent !== summary.originalSummary
    const isDifferentFromSaved = editedContent !== (summary.editedSummary || summary.originalSummary)
    setHasChanges(isDifferentFromSaved)
  }, [editedContent, summary.originalSummary, summary.editedSummary])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(editedContent)
      toast({
        title: "Summary saved",
        description: "Your changes have been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Save failed",
        description: "There was an error saving your changes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setEditedContent(summary.originalSummary)
    toast({
      title: "Summary reset",
      description: "Your changes have been discarded and the original summary restored.",
    })
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-bold mb-2">Review & Edit Summary</h2>
        <p className="text-muted-foreground">
          Review your AI-generated summary and make any necessary edits before sharing.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">{transcriptTitle}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Generated {formatDate(summary.createdAt)}
                  </div>
                  {summary.updatedAt && (
                    <div className="flex items-center gap-1">
                      <Edit3 className="h-3 w-3" />
                      Edited {formatDate(summary.updatedAt)}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && <Badge variant="secondary">Unsaved changes</Badge>}
              {summary.editedSummary && !hasChanges && <Badge variant="outline">Edited</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Edit Summary</TabsTrigger>
              <TabsTrigger value="compare">Compare Versions</TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="summary-editor" className="text-sm font-medium">
                    Summary Content
                  </label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleReset} disabled={!hasChanges || isSaving}>
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSave} disabled={!hasChanges || isSaving}>
                      <Save className="h-4 w-4 mr-1" />
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="summary-editor"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[400px] font-mono text-sm leading-relaxed"
                  placeholder="Edit your summary here..."
                  disabled={isSaving}
                />
              </div>
            </TabsContent>

            <TabsContent value="compare" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Original AI Summary</h4>
                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{summary.originalSummary}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Current Version</h4>
                  <div className="bg-card rounded-lg p-4 border">
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{editedContent}</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button variant="outline" size="lg" onClick={() => window.location.reload()} disabled={isLoading}>
          Start Over
        </Button>
        <Button size="lg" onClick={onShare} disabled={hasChanges || isLoading} className="min-w-[140px]">
          <Share className="h-4 w-4 mr-2" />
          {hasChanges ? "Save First" : "Share Summary"}
        </Button>
      </div>

      {hasChanges && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            You have unsaved changes. Please save your edits before sharing.
          </p>
        </div>
      )}
    </div>
  )
}
