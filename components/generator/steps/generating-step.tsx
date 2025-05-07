"use client"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import type { WizardData } from "../generator-wizard"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw } from "lucide-react"
import { generateClientThumbnail } from "@/lib/client-thumbnail-generator"

type GeneratingStepProps = {
  data: WizardData
  updateData: (data: Partial<WizardData>) => void
  onComplete: () => void
}

export function GeneratingStep({ data, updateData, onComplete }: GeneratingStepProps) {
  const { toast } = useToast()
  const [progress, setProgress] = useState(10)
  const [status, setStatus] = useState("Initializing...")
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [attempts, setAttempts] = useState(0)

  // Function to handle generation
  const handleGeneration = async () => {
    try {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set a timeout to handle stuck requests (now 90 seconds)
      timeoutRef.current = setTimeout(() => {
        setError("Generation timed out after 90 seconds. Please try again or use the client-side fallback.")
      }, 90000) // 90 seconds timeout

      // Update status and progress for better UX
      const statuses = [
        "Initializing...",
        "Processing images...",
        "Generating background...",
        "Applying style...",
        "Compositing layers...",
        "Finalizing thumbnail...",
      ]
      setStatus(statuses[0])
      setProgress(10)

      if (!data.hostImageUrl) {
        throw new Error("Host image is required")
      }

      let currentStep = 0
      const progressInterval = setInterval(() => {
        if (currentStep < statuses.length - 1) {
          currentStep++
          setStatus(statuses[currentStep])
          setProgress(Math.round(((currentStep + 1) / statuses.length) * 90)) // Up to 90%
        } else {
          clearInterval(progressInterval)
        }
      }, 1000)

      // 1. Start the async job
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style: data.style,
          realism: data.realism,
          title: data.title,
          hostImageUrl: data.hostImageUrl,
          guestImageUrls: data.guestImageUrls,
        }),
      })
      if (!response.ok) {
        clearInterval(progressInterval)
        throw new Error("Failed to start generation job")
      }
      const { generationId, success } = await response.json()
      if (!success || !generationId) {
        clearInterval(progressInterval)
        throw new Error("Failed to start generation job")
      }

      // 2. Poll for job status
      let pollCount = 0
      let finished = false
      while (!finished && pollCount < 30) { // 30 * 3s = 90s
        await new Promise((res) => setTimeout(res, 3000))
        pollCount++
        const pollRes = await fetch(`/api/generation/${generationId}`)
        if (!pollRes.ok) continue
        const pollData = await pollRes.json()
        if (pollData.status === "complete") {
          clearInterval(progressInterval)
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
          }
          setError(null)
          updateData({
            generationId: pollData.result.generationId,
            thumbnailUrl: pollData.result.thumbnailUrl,
            squareArtworkUrl: pollData.result.squareArtworkUrl,
            refinedTitle: pollData.result.refinedTitle,
          })
          setStatus("Thumbnail generated successfully!")
          setProgress(100)
          setTimeout(() => {
            onComplete()
          }, 1000)
          finished = true
        } else if (pollData.status === "failed") {
          clearInterval(progressInterval)
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
          }
          setError(pollData.error || "Generation failed. Please try again or use the client-side fallback.")
          finished = true
        }
      }
      if (!finished) {
        clearInterval(progressInterval)
        setError("Generation timed out after 90 seconds. Please try again or use the client-side fallback.")
      }
    } catch (error) {
      console.error("Error generating thumbnail:", error)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      setError(error instanceof Error ? error.message : "Failed to generate thumbnail")
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate thumbnail",
        variant: "destructive",
      })
    } finally {
      setIsRetrying(false)
      setAttempts((prev) => prev + 1)
    }
  }

  // Effect to start generation
  useEffect(() => {
    handleGeneration()

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data.style, data.realism, data.title, isRetrying]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = () => {
    setError(null)
    setIsRetrying(true)
  }

  const handleContinueWithFallback = async () => {
    try {
      setStatus("Generating fallback thumbnail...")
      setProgress(50)

      // Use the client-side thumbnail generator
      if (!data.hostImageUrl) {
        throw new Error("Host image is required")
      }

      // Generate YouTube thumbnail
      const thumbnailUrl = await generateClientThumbnail(
        {
          hostImageUrl: data.hostImageUrl,
          guestImageUrls: data.guestImageUrls,
          title: data.title,
          style: data.style,
          realism: data.realism,
        },
        "youtube",
      )

      // Generate square artwork
      const squareArtworkUrl = await generateClientThumbnail(
        {
          hostImageUrl: data.hostImageUrl,
          guestImageUrls: data.guestImageUrls,
          title: data.title,
          style: data.style,
          realism: data.realism,
        },
        "square",
      )

      // Update data with the canvas-generated thumbnails
      updateData({
        generationId: `fallback_${Date.now()}`,
        thumbnailUrl,
        squareArtworkUrl,
      })

      setProgress(100)
      setStatus("Fallback thumbnail generated successfully!")

      setTimeout(() => {
        onComplete()
      }, 1000)
    } catch (error) {
      console.error("Error generating fallback thumbnail:", error)

      // Use static placeholders as a last resort
      updateData({
        generationId: `static_${Date.now()}`,
        thumbnailUrl: "/thumbnail-placeholder.png",
        squareArtworkUrl: "/square-placeholder.png",
      })

      onComplete()
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-8 text-destructive">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="mb-2 text-2xl font-bold">Generation Failed</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">{error}</p>

        <div className="flex gap-4">
          <Button onClick={handleRetry} className="font-display" disabled={isRetrying || attempts >= 2}>
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Retrying...
              </>
            ) : (
              `Try Again ${attempts > 0 ? `(${attempts}/2)` : ""}`
            )}
          </Button>
          <Button onClick={handleContinueWithFallback} variant="outline">
            Use Client-Side Generator
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full border-8 border-gray-100 dark:border-gray-800">
        <div className="relative h-full w-full rounded-full">
          <div
            className="absolute inset-0 rounded-full border-8 border-primary"
            style={{
              clipPath: `polygon(0% 0%, ${progress}% 0%, ${progress}% 100%, 0% 100%)`,
              transform: "rotate(-90deg)",
              transformOrigin: "center",
            }}
          />
          <div className="flex h-full w-full items-center justify-center font-display text-2xl font-bold">
            {progress}%
          </div>
        </div>
      </div>

      <h2 className="mb-2 text-2xl font-bold">Generating Your Thumbnail</h2>
      <p className="text-center text-gray-500 dark:text-gray-400">{status}</p>

      <div className="mt-8 max-w-md text-center text-sm text-gray-500 dark:text-gray-400">
        We're creating your thumbnail with {data.style} style at {data.realism}% realism level for the title "
        {data.refinedTitle || data.title}".
      </div>
    </div>
  )
}
