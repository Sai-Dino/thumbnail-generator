import OpenAI from "openai"

// Initialize the OpenAI client with error handling
let openai: OpenAI | null = null
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  })
} catch (error) {
  console.error("Failed to initialize OpenAI client:", error)
}

// Generate a DALL-E image based on the podcast details
export async function generateThumbnailImage(
  title: string,
  style: string,
  realism: number,
  hostDescription?: string,
): Promise<string> {
  try {
    // Check if OpenAI client is initialized
    if (!openai) {
      throw new Error("OpenAI client is not initialized")
    }

    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured")
    }

    // Create a detailed prompt based on the podcast details
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

    // Create the prompt
    const prompt = `Create a professional podcast thumbnail for a podcast titled "${title}". 
    Style: ${styleDescription}, ${realismDesc}.
    The thumbnail should be eye-catching and suitable for YouTube.
    ${hostDescription ? `Include visual elements related to: ${hostDescription}` : ""}
    Include appropriate visual elements and typography that conveys the podcast theme.
    Do not include any text in the image.`

    console.log("DALL-E Prompt:", prompt)

    // For now, return a placeholder URL
    // In a production app, you would call the OpenAI API
    return "/thumbnail-placeholder.png"

    /* Commented out for now to avoid API errors
    // Generate the image using DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url",
    });

    // Return the image URL
    return response.data[0].url;
    */
  } catch (error) {
    console.error("Error generating image with DALL-E:", error)
    throw new Error(`Failed to generate thumbnail image: ${error.message}`)
  }
}

// Generate title suggestions based on a description
export async function generateTitleSuggestions(blurb: string): Promise<string[]> {
  try {
    // Check if OpenAI client is initialized
    if (!openai) {
      throw new Error("OpenAI client is not initialized")
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a podcast title expert. Generate 3 catchy, engaging podcast episode titles based on the description provided. Each title should be concise (under 60 characters) and compelling.",
        },
        {
          role: "user",
          content: `Generate 3 podcast episode titles based on this description: "${blurb}"`,
        },
      ],
      temperature: 0.8,
      max_tokens: 150,
    });

    // Extract titles from the response
    const content = response.choices[0].message.content;
    if (!content) return ["Episode Title 1", "Episode Title 2", "Episode Title 3"];

    // Parse the numbered list of titles
    const titles = content
      .split(/\d+\./)
      .map((title) => title.trim())
      .filter((title) => title.length > 0)
      .slice(0, 3);

    return titles.length > 0 ? titles : ["Episode Title 1", "Episode Title 2", "Episode Title 3"];
  } catch (error) {
    console.error("Error generating title suggestions:", error)
    return ["Episode Title 1", "Episode Title 2", "Episode Title 3"]
  }
}

// Refine a title using GPT
export async function refineTitle(title: string): Promise<string> {
  try {
    // Check if OpenAI client is initialized
    if (!openai) {
      throw new Error("OpenAI client is not initialized")
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a podcast title expert. Refine the provided podcast episode title to make it more engaging, catchy, and professional. Keep it concise (under 60 characters).",
        },
        {
          role: "user",
          content: `Refine this podcast episode title: "${title}"`,
        },
      ],
      temperature: 0.7,
      max_tokens: 60,
    });

    const refinedTitle = response.choices[0].message.content?.trim();
    return refinedTitle || title;
  } catch (error) {
    console.error("Error refining title:", error)
    return title
  }
}
