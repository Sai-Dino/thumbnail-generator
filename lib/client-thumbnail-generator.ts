// Client-side thumbnail generator that uses the actual uploaded images

export type ThumbnailOptions = {
  hostImageUrl: string
  guestImageUrls?: string[]
  title: string
  style: string
  realism: number
}

// Function to load an image and return it as an HTMLImageElement
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous" // Important for CORS
    img.onload = () => resolve(img)
    img.onerror = (e) => {
      console.error(`Failed to load image: ${src}`, e)
      reject(new Error(`Failed to load image: ${src}`))
    }
    img.src = src
  })
}

// Function to create a gradient background based on style
const createGradientBackground = (ctx: CanvasRenderingContext2D, style: string, width: number, height: number) => {
  let gradient: CanvasGradient

  switch (style) {
    case "photo_cine":
      gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, "#1a1a1a")
      gradient.addColorStop(1, "#4a4a4a")
      break
    case "semi_edi":
      gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, "#f5f5f5")
      gradient.addColorStop(1, "#e0e0e0")
      break
    case "bold_split":
      gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, "#FF5722")
      gradient.addColorStop(1, "#FF9800")
      break
    case "neon_retro":
      gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, "#000080")
      gradient.addColorStop(1, "#4B0082")
      break
    case "minimal_clean":
      gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, "#FFFFFF")
      gradient.addColorStop(1, "#F5F5F5")
      break
    case "comic_illus":
      gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, "#FFD54F")
      gradient.addColorStop(1, "#FFC107")
      break
    default:
      gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, "#1E1E1E")
      gradient.addColorStop(1, "#2D2D2D")
  }

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

// Main function to generate a thumbnail
export const generateClientThumbnail = async (
  options: ThumbnailOptions,
  type: "youtube" | "square" = "youtube",
): Promise<string> => {
  const { hostImageUrl, guestImageUrls = [], title, style } = options

  // Create canvas with appropriate dimensions
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("Could not get canvas context")
  }

  // Set dimensions based on type
  if (type === "youtube") {
    canvas.width = 1280
    canvas.height = 720
  } else {
    canvas.width = 1000
    canvas.height = 1000
  }

  try {
    // Create gradient background
    createGradientBackground(ctx, style, canvas.width, canvas.height)

    // Load host image
    const hostImage = await loadImage(hostImageUrl)

    // Calculate positions based on type and number of guests
    let hostX, hostY, hostWidth, hostHeight

    if (type === "youtube") {
      if (guestImageUrls.length === 0) {
        // Only host - center it
        hostWidth = 400
        hostHeight = 400
        hostX = (canvas.width - hostWidth) / 2
        hostY = (canvas.height - hostHeight) / 2
      } else {
        // Host on left
        hostWidth = 350
        hostHeight = 350
        hostX = canvas.width * 0.25 - hostWidth / 2
        hostY = (canvas.height - hostHeight) / 2
      }
    } else {
      // Square format
      if (guestImageUrls.length === 0) {
        // Only host - center it
        hostWidth = 500
        hostHeight = 500
        hostX = (canvas.width - hostWidth) / 2
        hostY = (canvas.height - hostHeight) / 2
      } else {
        // Host on left
        hostWidth = 400
        hostHeight = 400
        hostX = canvas.width * 0.25 - hostWidth / 2
        hostY = (canvas.height - hostHeight) / 2
      }
    }

    // Draw host image with error handling
    try {
      ctx.drawImage(hostImage, hostX, hostY, hostWidth, hostHeight)
    } catch (error) {
      console.error("Error drawing host image:", error)
      // Continue without host image
    }

    // Draw guest images if available
    if (guestImageUrls.length > 0) {
      try {
        const guestImage = await loadImage(guestImageUrls[0])

        let guestX, guestY, guestWidth, guestHeight

        if (type === "youtube") {
          guestWidth = 350
          guestHeight = 350
          guestX = canvas.width * 0.75 - guestWidth / 2
          guestY = (canvas.height - guestHeight) / 2
        } else {
          guestWidth = 400
          guestHeight = 400
          guestX = canvas.width * 0.75 - guestWidth / 2
          guestY = (canvas.height - guestHeight) / 2
        }

        ctx.drawImage(guestImage, guestX, guestY, guestWidth, guestHeight)
      } catch (error) {
        console.error("Failed to load guest image:", error)
        // Continue without guest image
      }
    }

    // Draw title with improved styling
    ctx.fillStyle = style === "semi_edi" || style === "minimal_clean" ? "#000000" : "#FFFFFF"
    ctx.textAlign = "center"

    // Adjust font size based on title length and canvas type
    const maxTitleLength = 30
    const titleFontSize =
      type === "youtube"
        ? Math.min(60, 60 * (maxTitleLength / Math.max(title.length, 1)))
        : Math.min(70, 70 * (maxTitleLength / Math.max(title.length, 1)))

    ctx.font = `bold ${titleFontSize}px Arial`

    // Position title
    const titleY = type === "youtube" ? 120 : 200

    // Draw title with shadow for better visibility
    if (style !== "semi_edi" && style !== "minimal_clean") {
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
    }

    ctx.fillText(title, canvas.width / 2, titleY)

    // Reset shadow
    ctx.shadowColor = "transparent"
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    // Add AIP badge
    ctx.fillStyle = "#FF6B00"
    ctx.font = "bold 24px Arial"
    ctx.textAlign = "right"
    ctx.fillText("AIP", canvas.width - 30, canvas.height - 30)

    // Return the data URL
    return canvas.toDataURL("image/png")
  } catch (error) {
    console.error("Error generating thumbnail:", error)
    throw error
  }
}
