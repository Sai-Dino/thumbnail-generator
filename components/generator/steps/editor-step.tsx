"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Layers, RefreshCw, Shuffle, Type, Undo, Redo, ImageIcon } from "lucide-react"
import { EmailModal } from "../email-modal"
import { useToast } from "@/hooks/use-toast"
import type { WizardData } from "../generator-wizard"
import { generateClientThumbnail } from "@/lib/client-thumbnail-generator"

type EditorStepProps = {
  data: WizardData
}

// Editor step that displays the generated thumbnails
export function EditorStep({ data }: EditorStepProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("youtube")
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [selectedColor, setSelectedColor] = useState("#FF6B00")
  const [textSize, setTextSize] = useState(70)
  const [selectedBackground, setSelectedBackground] = useState(0)

  function handleTabChange(value) {
    setActiveTab(value)
  }

  function handleDownload() {
    setShowEmailModal(true)
  }

  async function handleRegenerate() {
    setIsRegenerating(true)

    try {
      // Use client-side generation for reliability
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

      // Update the thumbnails
      data.thumbnailUrl = thumbnailUrl
      data.squareArtworkUrl = squareArtworkUrl

      toast({
        title: "Thumbnail Regenerated",
        description: "Your thumbnail has been regenerated successfully.",
      })
    } catch (error) {
      console.error("Error regenerating thumbnail:", error)
      toast({
        title: "Regeneration Failed",
        description: error.message || "Failed to regenerate thumbnail",
        variant: "destructive",
      })
    } finally {
      setIsRegenerating(false)
    }
  }

  function handleEmailVerified() {
    setIsDownloading(true)

    try {
      // Create a temporary link to download the image
      const link = document.createElement("a")
      const downloadUrl = activeTab === "youtube" ? data.thumbnailUrl : data.squareArtworkUrl

      if (!downloadUrl) {
        throw new Error("No image generated to download")
      }

      // For data URLs, we can download directly
      if (downloadUrl.startsWith("data:")) {
        link.href = downloadUrl
        link.download =
          activeTab === "youtube" ? `podcast-thumbnail-${Date.now()}.png` : `podcast-artwork-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // For remote URLs, we need to fetch them first
        fetch(downloadUrl)
          .then((response) => response.blob())
          .then((blob) => {
            const url = window.URL.createObjectURL(blob)
            link.href = url
            link.download =
              activeTab === "youtube" ? `podcast-thumbnail-${Date.now()}.png` : `podcast-artwork-${Date.now()}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
          })
      }

      toast({
        title: "Download Complete",
        description: "Your thumbnail has been downloaded successfully.",
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Download Failed",
        description: "There was an error downloading your thumbnail.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const backgroundVariations = [
    { name: "Studio", color: "#1E1E1E" },
    { name: "Gradient", color: "#3A3A3A" },
    { name: "Vibrant", color: "#FF5722" },
    { name: "Cool", color: "#2196F3" },
    { name: "Minimal", color: "#FFFFFF" },
    { name: "Warm", color: "#FFC107" },
  ]

  const colorAccents = ["#FF6B00", "#3B82F6", "#10B981", "#8B5CF6", "#EC4899", "#F59E0B"]

  function handleColorSelect(color) {
    setSelectedColor(color)
  }

  function handleTextSizeChange(value) {
    if (value && value.length > 0) {
      setTextSize(value[0])
    }
  }

  function handleBackgroundSelect(index) {
    setSelectedBackground(index)
  }

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Generated Thumbnail</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            <Undo className="mr-2 h-4 w-4" />
            Undo
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Redo className="mr-2 h-4 w-4" />
            Redo
          </Button>
          <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={isRegenerating}>
            {isRegenerating ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Shuffle className="mr-2 h-4 w-4" />
            )}
            {isRegenerating ? "Regenerating..." : "Regenerate"}
          </Button>
        </div>
      </div>

      {/* Show the refined title if available */}
      <div className="mb-4 text-center">
        <span className="text-lg font-semibold">{data.refinedTitle || data.title}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_1fr_250px]">
        {/* Left Sidebar - Layers */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-4 font-medium">Layers</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-md bg-primary/10 p-2 text-sm">
              <div className="flex items-center">
                <Layers className="mr-2 h-4 w-4" />
                Background
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md p-2 text-sm hover:bg-muted">
              <div className="flex items-center">
                <ImageIcon className="mr-2 h-4 w-4" />
                Host Face
              </div>
            </div>
            {data.guestImageUrls && data.guestImageUrls.length > 0 && (
              <div className="flex items-center justify-between rounded-md p-2 text-sm hover:bg-muted">
                <div className="flex items-center">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Guest Face
                </div>
              </div>
            )}
            <div className="flex items-center justify-between rounded-md p-2 text-sm hover:bg-muted">
              <div className="flex items-center">
                <Type className="mr-2 h-4 w-4" />
                Title Text
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md p-2 text-sm hover:bg-muted">
              <div className="flex items-center">
                <ImageIcon className="mr-2 h-4 w-4" />
                AIP Badge
              </div>
            </div>
          </div>
        </div>

        {/* Center - Canvas */}
        <div>
          <Tabs defaultValue="youtube" onValueChange={handleTabChange}>
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="youtube">YouTube (16:9)</TabsTrigger>
              <TabsTrigger value="square">Show Art (1:1)</TabsTrigger>
            </TabsList>
            <TabsContent value="youtube">
              <div className="relative aspect-video overflow-hidden rounded-lg border bg-gray-90">
                {isRegenerating ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-white">Regenerating thumbnail...</span>
                  </div>
                ) : (
                  <div className="relative h-full w-full">
                    <Image
                      src={data.thumbnailUrl || "/thumbnail-placeholder.png"}
                      alt="Thumbnail preview"
                      fill
                      className="object-contain"
                      unoptimized={true}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="square">
              <div className="relative aspect-square overflow-hidden rounded-lg border bg-gray-90">
                {isRegenerating ? (
                  <div className="flex h-full w-full items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-white">Regenerating artwork...</span>
                  </div>
                ) : (
                  <div className="relative h-full w-full">
                    <Image
                      src={data.squareArtworkUrl || "/square-placeholder.png"}
                      alt="Square art preview"
                      fill
                      className="object-contain"
                      unoptimized={true}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar - Style Controls */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-4 font-medium">Style Controls</h3>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Background Variation</label>
              <div className="grid grid-cols-3 gap-2">
                {backgroundVariations.map((bg, i) => (
                  <div
                    key={i}
                    className={`cursor-pointer overflow-hidden rounded-md border ${
                      selectedBackground === i ? "border-primary ring-2 ring-primary/50" : "hover:border-primary"
                    }`}
                    onClick={() => handleBackgroundSelect(i)}
                  >
                    <div
                      className="relative aspect-video"
                      style={{
                        background: bg.color,
                      }}
                    ></div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Background variations will be available in a future update.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Color Accent</label>
              <div className="flex flex-wrap gap-2">
                {colorAccents.map((color) => (
                  <div
                    key={color}
                    className={`h-8 w-8 cursor-pointer rounded-full border ${
                      selectedColor === color ? "ring-2 ring-primary ring-offset-2" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(color)}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Color accent customization will be available in a future update.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Text Size</label>
                <span className="text-xs">{textSize}%</span>
              </div>
              <Slider value={[textSize]} min={40} max={100} step={5} onValueChange={handleTextSizeChange} />
              <p className="mt-2 text-xs text-muted-foreground">
                Text size adjustment will be available in a future update.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleDownload} disabled={isDownloading || isRegenerating} className="font-display">
          {isDownloading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          {isDownloading ? "Downloading..." : `Export ${activeTab === "youtube" ? "Thumbnail" : "Show Art"}`}
        </Button>
      </div>

      <EmailModal open={showEmailModal} onClose={() => setShowEmailModal(false)} onVerified={handleEmailVerified} />
    </div>
  )
}
