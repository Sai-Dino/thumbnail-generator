import { put } from "@vercel/blob"

// Upload a file to Vercel Blob
export async function uploadToBlob(file: File, prefix = ""): Promise<string> {
  try {
    // Generate a unique filename with the provided prefix
    const filename = prefix ? `${prefix}-${Date.now()}-${file.name}` : `${Date.now()}-${file.name}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, { access: "public" })

    return blob.url
  } catch (error) {
    console.error("Error uploading to Blob:", error)
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Upload a URL to Vercel Blob (useful for saving OpenAI generated images)
export async function uploadUrlToBlob(url: string, filename: string): Promise<string> {
  try {
    // Check if the URL is already a placeholder
    if (url.startsWith("/placeholder.svg")) {
      // Just return the placeholder URL, no need to upload to Blob
      return url
    }

    // Fetch the image from the URL
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    // Convert to blob
    const imageBlob = await response.blob()

    // Upload to Vercel Blob
    const blob = await put(filename, imageBlob, { access: "public" })

    return blob.url
  } catch (error) {
    console.error("Error uploading URL to Blob:", error)

    // Return the original URL if we can't upload to Blob
    return url
  }
}
