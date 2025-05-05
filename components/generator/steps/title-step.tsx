"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import type { WizardData } from "../generator-wizard"
import { ArrowLeft, ArrowRight, Sparkles, RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

type TitleStepProps = {
  data: WizardData
  updateData: (data: Partial<WizardData>) => void
  onNext: () => void
  onBack: () => void
}

export function TitleStep({ data, updateData, onNext, onBack }: TitleStepProps) {
  const { toast } = useToast()
  const [titleType, setTitleType] = useState<"have" | "need">("have")
  const [title, setTitle] = useState<string>(data.title || "")
  const [blurb, setBlurb] = useState<string>("")
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [isRefining, setIsRefining] = useState<boolean>(false)
  const [apiError, setApiError] = useState<boolean>(false)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleBlurbChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBlurb(e.target.value)
  }

  const handleRefineTitle = async () => {
    if (!title.trim()) return

    setIsRefining(true)

    try {
      // If we've already had an API error, use the fallback refinement
      if (apiError) {
        // Simple client-side refinement
        const words = title.split(" ")
        const capitalizedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1))

        // Add some podcast-like flair if not already present
        let refinedTitle = capitalizedWords.join(" ")
        if (!refinedTitle.includes(":") && Math.random() > 0.5) {
          const firstPart = capitalizedWords.slice(0, Math.ceil(words.length / 2)).join(" ")
          const secondPart = capitalizedWords.slice(Math.ceil(words.length / 2)).join(" ")
          refinedTitle = `${firstPart}: ${secondPart}`
        }

        setTitle(refinedTitle)

        toast({
          title: "Title Refined",
          description: "Your title has been refined (using fallback).",
        })

        return
      }

      const response = await fetch("/api/title/refine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ original: title }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Refinement failed: ${response.status} ${response.statusText}`)
      }

      if (data.success && data.refined) {
        setTitle(data.refined)
        toast({
          title: "Title Refined",
          description: "Your title has been refined successfully.",
        })
      } else {
        throw new Error(data.message || "Failed to refine title")
      }
    } catch (error) {
      console.error("Error refining title:", error)
      setApiError(true)

      // Use a simple fallback refinement
      const words = title.split(" ")
      const capitalizedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1))

      const refinedTitle = capitalizedWords.join(" ")
      setTitle(refinedTitle)

      toast({
        title: "Using Fallback Refinement",
        description: "We couldn't connect to our AI service, so we're using a simple refinement instead.",
        variant: "destructive",
      })
    } finally {
      setIsRefining(false)
    }
  }

  const handleGenerateTitles = async () => {
    if (!blurb.trim()) return

    setIsGenerating(true)

    try {
      // If we've already had an API error, use the fallback generation
      if (apiError) {
        // Generate some generic podcast titles based on the blurb
        const keywords = blurb
          .split(" ")
          .filter((word) => word.length > 3)
          .map((word) => word.replace(/[^\w\s]/gi, ""))

        const fallbackTitles = [
          `Exploring ${keywords[0] || "Perspectives"}: ${keywords[1] || "A Deep Dive"}`,
          `The ${keywords[0] || "Ultimate"} ${keywords[1] || "Guide"} to Success`,
          `Beyond the ${keywords[0] || "Ordinary"}: ${keywords[1] || "New Insights"}`,
        ]

        setSuggestedTitles(fallbackTitles)

        toast({
          title: "Titles Generated",
          description: "Title suggestions have been generated (using fallback).",
        })

        return
      }

      const response = await fetch("/api/title/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ blurb }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Generation failed: ${response.status} ${response.statusText}`)
      }

      if (data.success && data.suggestions && data.suggestions.length > 0) {
        setSuggestedTitles(data.suggestions)
        toast({
          title: "Titles Generated",
          description: "Title suggestions have been generated successfully.",
        })
      } else {
        throw new Error(data.message || "Failed to generate title suggestions")
      }
    } catch (error) {
      console.error("Error generating title suggestions:", error)
      setApiError(true)

      // Generate some generic podcast titles based on the blurb
      const keywords = blurb
        .split(" ")
        .filter((word) => word.length > 3)
        .map((word) => word.replace(/[^\w\s]/gi, ""))

      const fallbackTitles = [
        `Exploring ${keywords[0] || "Perspectives"}: ${keywords[1] || "A Deep Dive"}`,
        `The ${keywords[0] || "Ultimate"} ${keywords[1] || "Guide"} to Success`,
        `Beyond the ${keywords[0] || "Ordinary"}: ${keywords[1] || "New Insights"}`,
      ]

      setSuggestedTitles(fallbackTitles)

      toast({
        title: "Using Fallback Suggestions",
        description: "We couldn't connect to our AI service, so we're using simple title suggestions instead.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const selectSuggestedTitle = (selectedTitle: string) => {
    setTitle(selectedTitle)
    setTitleType("have")
  }

  const handleContinue = () => {
    updateData({ title })
    onNext()
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Add Title</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Enter your episode title or let us suggest one for you.</p>
      </div>

      <Tabs defaultValue={titleType} onValueChange={(value) => setTitleType(value as "have" | "need")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="have">I have a title</TabsTrigger>
          <TabsTrigger value="need">I need a title</TabsTrigger>
        </TabsList>

        <TabsContent value="have" className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Episode Title</label>
            <div className="flex gap-2">
              <Input
                value={title}
                onChange={handleTitleChange}
                placeholder="Enter your episode title"
                className="flex-1"
              />
              <Button variant="outline" onClick={handleRefineTitle} disabled={!title.trim() || isRefining}>
                {isRefining ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Refine
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="need" className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Episode Description</label>
            <Textarea
              value={blurb}
              onChange={handleBlurbChange}
              placeholder="Briefly describe what your episode is about (max 140 characters)"
              maxLength={140}
              rows={3}
            />
            <div className="flex justify-end">
              <span className="text-xs text-gray-500">{blurb.length}/140 characters</span>
            </div>
          </div>

          <Button onClick={handleGenerateTitles} disabled={!blurb.trim() || isGenerating} className="w-full">
            {isGenerating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate Title Suggestions
          </Button>

          {suggestedTitles.length > 0 && (
            <div className="space-y-3 rounded-lg border bg-gray-50 p-4 dark:bg-gray-800/50">
              <h3 className="font-medium">Suggested Titles</h3>
              <div className="space-y-2">
                {suggestedTitles.map((suggestedTitle, index) => (
                  <div
                    key={index}
                    className="cursor-pointer rounded-md border bg-white p-3 hover:border-primary dark:bg-gray-800"
                    onClick={() => selectSuggestedTitle(suggestedTitle)}
                  >
                    {suggestedTitle}
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleContinue} disabled={!title.trim()} className="font-display">
          Generate Thumbnail <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
