"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileSelect: (file: File, title: string) => void
  isLoading?: boolean
}

export function FileUpload({ onFileSelect, isLoading }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0]
        if (file.type === "text/plain" || file.name.endsWith(".txt")) {
          setSelectedFile(file)
          if (!title) {
            setTitle(file.name.replace(".txt", ""))
          }
        }
      }
    },
    [title],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0]
        setSelectedFile(file)
        if (!title) {
          setTitle(file.name.replace(".txt", ""))
        }
      }
    },
    [title],
  )

  const handleSubmit = () => {
    if (selectedFile && title.trim()) {
      onFileSelect(selectedFile, title.trim())
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setTitle("")
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Upload Meeting Transcript</h2>
            <p className="text-muted-foreground">
              Upload your meeting transcript as a text file to get started with AI-powered summarization.
            </p>
          </div>

          {!selectedFile ? (
            <div
              className={cn(
                "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Drag and drop your transcript file here</p>
                <p className="text-sm text-muted-foreground">or click to browse files</p>
              </div>
              <input
                type="file"
                accept=".txt,text/plain"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isLoading}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <FileText className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <Button variant="ghost" size="sm" onClick={clearFile} disabled={isLoading}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title</Label>
            <Input
              id="title"
              placeholder="e.g., Weekly Team Standup - March 15"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || !title.trim() || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? "Processing..." : "Continue to Summarization"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
