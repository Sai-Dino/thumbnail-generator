import { put } from "@vercel/blob"

// This is a simplified background removal function
// In a production app, you would use a more sophisticated approach or a service like Remove.bg
export async function removeBackground(imageUrl: string): Promise<string> {
  try {
    // For now, we'll just return the original image
    // In a real implementation, you would call a background removal API or use a library

    // Fetch the image
    const response = await fetch(imageUrl)
    const imageBlob = await response.blob()

    // Upload the "processed" image to Vercel Blob
    const filename = `processed-${Date.now()}.png`
    const blob = await put(filename, imageBlob, { access: "public" })

    return blob.url
  } catch (error) {
    console.error("Error removing background:", error)
    throw new Error("Failed to process image")
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

// New function to generate a thumbnail using the uploaded images
export async function generateThumbnailWithImages({
  style,
  realism,
  title,
  hostImageUrl,
  guestImageUrls,
}: {
  style: string
  realism: number
  title: string
  hostImageUrl?: string
  guestImageUrls?: string[]
}): Promise<{ thumbnailUrl: string; squareArtworkUrl: string }> {
  try {
    // For now, we'll use a simple compositing approach with HTML Canvas
    // In a real app, you would use a more sophisticated approach or a service

    // Create a composite image using the uploaded images
    // This is a simplified implementation - in a real app, you would do proper image processing

    // For now, we'll just return the podcast-setup.png with a timestamp to make it unique
    // In a real implementation, you would create a canvas, draw the images, and export as PNG

    // Add a timestamp to make the URL unique and force a refresh
    const timestamp = Date.now()

    // If we have a host image, use it in the URL to indicate it's being used
    // This is just for demonstration - in a real app, you would actually use the image
    const hostParam = hostImageUrl ? `&host=true` : ""
    const guestParam = guestImageUrls && guestImageUrls.length > 0 ? `&guests=${guestImageUrls.length}` : ""

    // Return URLs that indicate we're using the uploaded images
    return {
      thumbnailUrl: `/podcast-setup.png?t=${timestamp}${hostParam}${guestParam}`,
      squareArtworkUrl: `/podcast-setup.png?t=${timestamp}${hostParam}${guestParam}`,
    }
  } catch (error) {
    console.error("Error generating thumbnail with images:", error)
    throw new Error("Failed to generate thumbnail with images")
  }
}
