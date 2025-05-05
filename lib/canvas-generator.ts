// This is a client-side utility for generating thumbnails using Canvas
// In a real app, you would use a more sophisticated approach or a service

export async function generateCanvasThumbnail({
  hostImageUrl,
  guestImageUrls,
  title,
  style,
}: {
  hostImageUrl?: string
  guestImageUrls?: string[]
  title: string
  style: string
}): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Create a canvas element
      const canvas = document.createElement("canvas")
      canvas.width = 1280
      canvas.height = 720
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }

      // Draw background
      ctx.fillStyle = "#1E1E1E"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw title
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "bold 48px Arial"
      ctx.textAlign = "center"
      ctx.fillText(title, canvas.width / 2, 100)

      // Load and draw host image if available
      if (hostImageUrl) {
        const hostImage = new Image()
        hostImage.crossOrigin = "anonymous"
        hostImage.onload = () => {
          // Draw host image on the left side
          ctx.drawImage(hostImage, 200, 200, 300, 300)

          // Load and draw guest image if available
          if (guestImageUrls && guestImageUrls.length > 0) {
            const guestImage = new Image()
            guestImage.crossOrigin = "anonymous"
            guestImage.onload = () => {
              // Draw guest image on the right side
              ctx.drawImage(guestImage, 780, 200, 300, 300)

              // Convert canvas to data URL and resolve
              resolve(canvas.toDataURL("image/png"))
            }
            guestImage.onerror = () => {
              // If guest image fails, still resolve with what we have
              resolve(canvas.toDataURL("image/png"))
            }
            guestImage.src = guestImageUrls[0]
          } else {
            // No guest image, resolve with just the host
            resolve(canvas.toDataURL("image/png"))
          }
        }
        hostImage.onerror = () => {
          // If host image fails, resolve with just the title
          resolve(canvas.toDataURL("image/png"))
        }
        hostImage.src = hostImageUrl
      } else {
        // No host image, resolve with just the title
        resolve(canvas.toDataURL("image/png"))
      }
    } catch (error) {
      reject(error)
    }
  })
}
