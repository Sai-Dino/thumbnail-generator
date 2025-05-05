import { NextResponse } from "next/server"
import OpenAI from "openai"
import { put } from "@vercel/blob"
import { refineTitle } from "@/lib/openai"

// Initialize OpenAI client with better error handling
let openai: OpenAI | null = null
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  } else {
    console.warn("OPENAI_API_KEY is not set. Using fallback mode.")
  }
} catch (error) {
  console.error("Failed to initialize OpenAI client:", error)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { style, realism, title, hostImageUrl, guestImageUrls } = body

    // Validate required fields
    if (!style || !title) {
      return NextResponse.json({ success: false, message: "Style and title are required" }, { status: 400 })
    }

    // Generate a unique ID for this generation
    const generationId = `gen_${Date.now()}`

    console.log(`Generating thumbnail with style: ${style}, realism: ${realism}, title: ${title}`)
    console.log(`Host image: ${hostImageUrl ? "provided" : "missing"}, Guest images: ${guestImageUrls?.length || 0}`)

    // Check if OpenAI client is initialized
    if (!openai) {
      console.error("OpenAI client is not initialized")
      throw new Error("OpenAI service is currently unavailable")
    }

    // Refine the title using GPT-4o
    const refinedTitle = await refineTitle(title)
    console.log("Refined title for image generation:", refinedTitle)

    // Create style description based on selected style
    let styleDescription = ""
    switch (style) {
      case "photo_cine":
        styleDescription = "cinematic style with dramatic lighting and depth of field"
        break
      case "semi_edi":
        styleDescription = "editorial illustration style with flat shading and muted color palette"
        break
      case "bold_split":
        styleDescription = "vector pop-art style with split complementary colors and bold outlines"
        break
      case "neon_retro":
        styleDescription = "80s retro style with neon colors and synthwave aesthetic"
        break
      case "minimal_clean":
        styleDescription = "minimalist design with clean lines and ample whitespace"
        break
      case "comic_illus":
        styleDescription = "comic book illustration style with bold colors and line art"
        break
      default:
        styleDescription = "professional podcast thumbnail style"
    }

    // Adjust realism description
    const realismDesc = realism > 70 ? "highly realistic" : realism > 40 ? "semi-realistic" : "stylized"

    // Create the prompt for DALL-E using the refined title
    const prompt = `Create a professional podcast thumbnail for a podcast titled "${refinedTitle}". \nStyle: ${styleDescription}, ${realismDesc}.\nThe thumbnail should be eye-catching and suitable for YouTube.\nInclude appropriate visual elements that convey the podcast theme.\nMake it look professional and high-quality.\nDo not include any text in the image.`

    console.log("DALL-E Prompt:", prompt)

    try {
      // Generate the image using DALL-E
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1792x1024", // 16:9 aspect ratio for YouTube
        response_format: "url",
      })

      if (!response.data || !response.data[0] || !response.data[0].url) {
        throw new Error("Failed to generate image with DALL-E: No image URL returned")
      }
      const imageUrl = response.data[0].url

      console.log("Generated image URL:", imageUrl)

      // Download the image and upload to Vercel Blob for persistence
      const imageResponse = await fetch(imageUrl)
      const imageBlob = await imageResponse.blob()

      const thumbnailBlob = await put(`thumbnails/${generationId}.png`, imageBlob, {
        access: "public",
      })

      // Create a square version for podcast artwork
      const squareResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024", // Square for podcast artwork
        response_format: "url",
      })

      if (!squareResponse.data || !squareResponse.data[0] || !squareResponse.data[0].url) {
        throw new Error("Failed to generate square image with DALL-E: No image URL returned")
      }
      const squareImageUrl = squareResponse.data[0].url
      const squareImageResponse = await fetch(squareImageUrl)
      const squareImageBlob = await squareImageResponse.blob()

      const squareBlob = await put(`thumbnails/${generationId}_square.png`, squareImageBlob, {
        access: "public",
      })

      return NextResponse.json({
        success: true,
        generationId,
        thumbnailUrl: thumbnailBlob.url,
        squareArtworkUrl: squareBlob.url,
        refinedTitle,
        message: "Thumbnail generated successfully with OpenAI",
      })
    } catch (generationError: unknown) {
      console.error("Error in OpenAI image generation:", generationError)
      throw new Error(`Error in OpenAI image generation: ${generationError instanceof Error ? generationError.message : String(generationError)}`)
    }
  } catch (error) {
    console.error("Error in generate API:", error)

    // Return a more detailed error response
    return NextResponse.json(
      {
        success: false,
        message: `Failed to generate thumbnail: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.stack : undefined,
        shouldUseFallback: true,
      },
      { status: 500 },
    )
  }
}
