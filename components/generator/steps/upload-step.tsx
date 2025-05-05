"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { WizardData } from "../generator-wizard"
import { Upload, Plus, X, ArrowRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type UploadStepProps = {
  data: WizardData
  updateData: (data: Partial<WizardData>) => void
  onNext: () => void
}

export function UploadStep({ data, updateData, onNext }: UploadStepProps) {
  const { toast } = useToast()
  const [hostPreview, setHostPreview] = useState<string | null>(data.hostImageUrl || null)
  const [guestPreviews, setGuestPreviews] = useState<string[]>(data.guestImageUrls || [])
  const [isDraggingHost, setIsDraggingHost] = useState(false)
  const [isDraggingGuest, setIsDraggingGuest] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const uploadFile = async (file: File, prefix: string): Promise<string | null> => {
    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("prefix", prefix)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Upload failed")
      }

      return data.url
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Upload Failed",
        description:
          error instanceof Error ? error.message : "There was an error uploading your image. Please try again.",
        variant: "destructive",
      })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleHostImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview immediately for better UX
    const reader = new FileReader()
    reader.onload = () => {
      setHostPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload the file
    const url = await uploadFile(file, "host")
    if (url) {
      updateData({ hostImageUrl: url })
    } else {
      // Reset preview if upload failed
      setHostPreview(data.hostImageUrl || null)
    }
  }

  const handleGuestImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Process each file
    const newGuestPreviews = [...guestPreviews]
    const newGuestUrls = [...(data.guestImageUrls || [])]

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Show preview immediately
      const reader = new FileReader()
      reader.onload = () => {
        newGuestPreviews.push(reader.result as string)
        setGuestPreviews([...newGuestPreviews])
      }
      reader.readAsDataURL(file)

      // Upload the file
      const url = await uploadFile(file, "guest")
      if (url) {
        newGuestUrls.push(url)
      }
    }

    updateData({ guestImageUrls: newGuestUrls })
  }

  const removeGuestImage = (index: number) => {
    const newGuestPreviews = [...guestPreviews]
    newGuestPreviews.splice(index, 1)
    setGuestPreviews(newGuestPreviews)

    const newGuestUrls = [...(data.guestImageUrls || [])]
    newGuestUrls.splice(index, 1)
    updateData({ guestImageUrls: newGuestUrls })
  }

  const handleHostDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingHost(true)
  }

  const handleHostDragLeave = () => {
    setIsDraggingHost(false)
  }

  const handleHostDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingHost(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = () => {
      setHostPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload the file
    const url = await uploadFile(file, "host")
    if (url) {
      updateData({ hostImageUrl: url })
    } else {
      // Reset preview if upload failed
      setHostPreview(data.hostImageUrl || null)
    }
  }

  const handleGuestDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingGuest(true)
  }

  const handleGuestDragLeave = () => {
    setIsDraggingGuest(false)
  }

  const handleGuestDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingGuest(false)

    const files = e.dataTransfer.files
    if (!files || files.length === 0) return

    // Process each file
    const newGuestPreviews = [...guestPreviews]
    const newGuestUrls = [...(data.guestImageUrls || [])]

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Show preview immediately
      const reader = new FileReader()
      reader.onload = () => {
        newGuestPreviews.push(reader.result as string)
        setGuestPreviews([...newGuestPreviews])
      }
      reader.readAsDataURL(file)

      // Upload the file
      const url = await uploadFile(file, "guest")
      if (url) {
        newGuestUrls.push(url)
      }
    }

    updateData({ guestImageUrls: newGuestUrls })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Upload Faces</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Upload images of the host and guests. We'll automatically remove the backgrounds.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Host Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Host Image (Required)</label>
          <div
            className={`relative flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors ${
              isDraggingHost
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-primary dark:border-gray-700"
            } ${hostPreview ? "bg-gray-50 dark:bg-gray-800/50" : ""}`}
            onDragOver={handleHostDragOver}
            onDragLeave={handleHostDragLeave}
            onDrop={handleHostDrop}
          >
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={handleHostImageChange}
              disabled={isUploading}
            />

            {hostPreview ? (
              <div className="relative h-full w-full">
                <Image src={hostPreview || "/placeholder.svg"} alt="Host preview" fill className="object-contain" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <Upload className="mb-2 h-10 w-10 text-gray-400" />
                <p className="text-sm font-medium">Drag & drop or click to upload</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">PNG, JPG or WEBP (min. 512x512px)</p>
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="text-center">
                  <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <p className="text-sm">Uploading...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Guest Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Guest Images (Optional)</label>
          <div
            className={`relative flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors ${
              isDraggingGuest
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-primary dark:border-gray-700"
            } ${guestPreviews.length > 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""}`}
            onDragOver={handleGuestDragOver}
            onDragLeave={handleGuestDragLeave}
            onDrop={handleGuestDrop}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={handleGuestImageChange}
              disabled={isUploading}
            />

            {guestPreviews.length > 0 ? (
              <div className="grid h-full w-full grid-cols-2 gap-2 overflow-auto p-2">
                {guestPreviews.map((preview, index) => (
                  <div key={index} className="relative rounded-md bg-white dark:bg-gray-800">
                    <button
                      type="button"
                      className="absolute -right-2 -top-2 z-10 rounded-full bg-destructive p-1 text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeGuestImage(index)
                      }}
                      disabled={isUploading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="relative h-16 w-full">
                      <Image
                        src={preview || "/placeholder.svg"}
                        alt={`Guest ${index + 1} preview`}
                        fill
                        className="rounded-md object-cover"
                      />
                    </div>
                  </div>
                ))}
                {guestPreviews.length < 3 && (
                  <button
                    type="button"
                    className="flex h-16 items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                    onClick={() => document.querySelector<HTMLInputElement>("input[multiple]")?.click()}
                    disabled={isUploading}
                  >
                    <Plus className="h-6 w-6 text-gray-400" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <Upload className="mb-2 h-10 w-10 text-gray-400" />
                <p className="text-sm font-medium">Drag & drop or click to upload</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Add up to 3 guest images</p>
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="text-center">
                  <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <p className="text-sm">Uploading...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!data.hostImageUrl || isUploading} className="font-display">
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
