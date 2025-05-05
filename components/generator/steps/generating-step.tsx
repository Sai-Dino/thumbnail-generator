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

      // Set a timeout to handle stuck requests
      timeoutRef.current = setTimeout(() => {
        setError("Generation is taking longer than expected. Please try the client-side fallback.")
      }, 15000) // 15 seconds timeout

      // Update status and progress for better UX
      const statuses = [
        "Initializing...",
        "Processing images...",
        "Generating background...",
        "Applying style...",
        "Compositing layers...",
        "Finalizing thumbnail...",
      ]

      // Show initial status
      setStatus(statuses[0])
      setProgress(10)

      // Validate required data
      if (!data.hostImageUrl) {
        throw new Error("Host image is required")
      }

      // Simulate progress through the steps while waiting for the API
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

      try {
        // Make the API call with all the necessary data
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            style: data.style,
            realism: data.realism,
            title: data.title,
            hostImageUrl: data.hostImageUrl,
            guestImageUrls: data.guestImageUrls,
          }),
        })

        // Clear the progress interval
        clearInterval(progressInterval)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `API request failed with status ${response.status}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.message || "Generation failed")
        }

        // Clear the timeout since we got a response
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }

        // Update with the generation result
        updateData({
          generationId: result.generationId,
          thumbnailUrl: result.thumbnailUrl,
          squareArtworkUrl: result.squareArtworkUrl,
          refinedTitle: result.refinedTitle,
        })

        // Show progress through the steps
        setStatus("Thumbnail generated successfully!")
        setProgress(100)

        // Complete the generation
        setTimeout(() => {
          onComplete()
        }, 1000)
      } catch (apiError) {
        console.error("API generation failed, falling back to client-side generation:", apiError)
        
        // Try client-side generation as fallback
        try {
          setStatus("Falling back to client-side generation...")
          
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

          // Update with the client-side generation result
          updateData({
            generationId: `client_${Date.now()}`,
            thumbnailUrl,
            squareArtworkUrl,
          })

          setStatus("Client-side thumbnail generated successfully!")
          setProgress(100)

          setTimeout(() => {
            onComplete()
          }, 1000)
        } catch (clientError) {
          console.error("Client-side generation failed:", clientError)
          throw new Error("Both API and client-side generation failed. Please try again.")
        }
      }
    } catch (error) {
      console.error("Error generating thumbnail:", error)

      // Clear the timeout if it exists
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      // Set error state
      setError(error instanceof Error ? error.message : "Failed to generate thumbnail")

      // Log detailed error information
      console.log("Generation error details:", {
        style: data.style,
        realism: data.realism,
        title: data.title,
        hostImageUrl: data.hostImageUrl ? "present" : "missing",
        guestImageUrls: data.guestImageUrls ? data.guestImageUrls.length : 0,
        error: error instanceof Error ? error.message : String(error),
      })

      // Show error toast
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
