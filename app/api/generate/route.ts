import { NextResponse } from "next/server"
import OpenAI from "openai"
import { put } from "@vercel/blob"
import { refineTitle, describePersonInImage } from "@/lib/openai"

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

// Global in-memory job store (for demo; use Redis/DB for production)
const globalAny = globalThis as any;
if (!globalAny.jobStore) globalAny.jobStore = {};
const jobStore: Record<string, any> = globalAny.jobStore;

export async function POST(request: Request) {
  try {
    const startTime = Date.now();
    const body = await request.json();
    const { style, realism, title, hostImageUrl, guestImageUrls } = body;

    // Validate required fields
    if (!style || !title) {
      return NextResponse.json({ success: false, message: "Style and title are required" }, { status: 400 })
    }

    // Generate a unique ID for this generation
    const generationId = `gen_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Store job as pending
    jobStore[generationId] = {
      status: 'pending',
      created: Date.now(),
      result: null,
      error: null,
    };

    // Start the image generation in the background
    (async () => {
      try {
        console.log(`[${new Date().toISOString()}] Generating thumbnail with style: ${style}, realism: ${realism}, title: ${title}`)
        console.log(`[${new Date().toISOString()}] Host image: ${hostImageUrl ? "provided" : "missing"}, Guest images: ${guestImageUrls?.length || 0}`)

        // Check if OpenAI client is initialized
        if (!openai) {
          console.error("OpenAI client is not initialized")
          throw new Error("OpenAI service is currently unavailable")
        }

        // Refine the title using GPT-4o
        const refineStart = Date.now();
        const refinedTitle = await refineTitle(title)
        console.log(`[${new Date().toISOString()}] Refined title for image generation: "${refinedTitle}" (took ${Date.now() - refineStart}ms)`);

        // Vision-to-prompt: describe the host image if provided
        let hostDescription = "";
        if (hostImageUrl) {
          hostDescription = await describePersonInImage(hostImageUrl);
          console.log(`[${new Date().toISOString()}] Host image description: ${hostDescription}`);
        }

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

        // Create the prompt for DALL-E using the refined title and host description
        const prompt = `Create a professional podcast thumbnail for a podcast titled "${refinedTitle}".\nStyle: ${styleDescription}, ${realismDesc}.\nThe thumbnail should be eye-catching and suitable for YouTube.\n${hostDescription ? `The main person should look like: ${hostDescription}.` : ""}\nInclude appropriate visual elements that convey the podcast theme.\nMake it look professional and high-quality.\nDo not include any text in the image.`

        console.log(`[${new Date().toISOString()}] DALL-E Prompt:`, prompt)

        // Generate the image using GPT-4 Vision
        const imageGenStart = Date.now();
        const response = await openai.images.generate({
          model: "gpt-image-1",
          prompt: prompt,
          n: 1,
          size: "1536x1024", // Closest to 16:9 aspect ratio for YouTube
        })
        console.log(`[${new Date().toISOString()}] OpenAI image generation response received (took ${Date.now() - imageGenStart}ms)`);

        if (!response.data || !response.data[0] || !response.data[0].b64_json) {
          throw new Error("Failed to generate image with GPT-4 Vision: No image data returned")
        }
        const b64 = response.data[0].b64_json;
        const buffer = Buffer.from(b64, "base64");
        const imageBlob = new Blob([buffer], { type: "image/png" });

        const uploadStart = Date.now();
        const thumbnailBlob = await put(`thumbnails/${generationId}.png`, imageBlob, {
          access: "public",
          addRandomSuffix: true,
        })
        console.log(`[${new Date().toISOString()}] Uploaded 16:9 thumbnail to blob storage (took ${Date.now() - uploadStart}ms)`);

        // --- TEMPORARILY COMMENT OUT SQUARE ARTWORK GENERATION FOR SPEED TEST ---
        // const squareResponse = await openai.images.generate({
        //   model: "gpt-image-1",
        //   prompt: prompt,
        //   n: 1,
        //   size: "1024x1024", // Square for podcast artwork
        // })
        // if (!squareResponse.data || !squareResponse.data[0] || !squareResponse.data[0].b64_json) {
        //   throw new Error("Failed to generate square image with GPT-4 Vision: No image data returned")
        // }
        // const squareB64 = squareResponse.data[0].b64_json;
        // const squareBuffer = Buffer.from(squareB64, "base64");
        // const squareImageBlob = new Blob([squareBuffer], { type: "image/png" });
        // const squareBlob = await put(`thumbnails/${generationId}_square.png`, squareImageBlob, {
        //   access: "public",
        //   addRandomSuffix: true,
        // })
        // console.log(`[${new Date().toISOString()}] Uploaded square artwork to blob storage`);

        const totalTime = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] Sending response (total time: ${totalTime}ms)`);
        jobStore[generationId] = {
          status: 'complete',
          result: {
            generationId,
            thumbnailUrl: thumbnailBlob.url,
            squareArtworkUrl: null, // Temporarily null
            refinedTitle,
            message: "Thumbnail generated successfully with OpenAI (16:9 only)",
            timing: {
              refineTitle: refineStart ? (imageGenStart - refineStart) : null,
              imageGen: imageGenStart ? (uploadStart - imageGenStart) : null,
              upload: uploadStart ? (Date.now() - uploadStart) : null,
              total: totalTime,
            }
          },
          error: null,
          finished: Date.now(),
        };
      } catch (err) {
        jobStore[generationId] = {
          status: 'failed',
          result: null,
          error: err instanceof Error ? err.message : String(err),
          finished: Date.now(),
        };
      }
    })();

    // Immediately return the generationId and pending status
    return NextResponse.json({ success: true, generationId, status: 'pending' });
  } catch (error) {
    console.error("Error in generate API:", error)

    // Return a more detailed error response
    return NextResponse.json(
      {
        success: false,
        message: `Failed to start thumbnail generation: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.stack : undefined,
        shouldUseFallback: true,
      },
      { status: 500 },
    )
  }
}
