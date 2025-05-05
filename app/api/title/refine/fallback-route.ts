import { NextResponse } from "next/server"

// This is a fallback route that doesn't rely on the OpenAI API
// It can be used if the API is not working or if you want to test the UI without making API calls
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { original } = body

    if (!original || original.trim().length === 0) {
      return NextResponse.json({ success: false, message: "Original title is required" }, { status: 400 })
    }

    // Simple refinement logic - capitalize words and add some flair
    const words = original.split(" ")
    const capitalizedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1))

    // Add some podcast-like flair if not already present
    let refined = capitalizedWords.join(" ")
    if (!refined.includes(":") && Math.random() > 0.5) {
      const firstPart = capitalizedWords.slice(0, Math.ceil(words.length / 2)).join(" ")
      const secondPart = capitalizedWords.slice(Math.ceil(words.length / 2)).join(" ")
      refined = `${firstPart}: ${secondPart}`
    }

    return NextResponse.json({
      success: true,
      original,
      refined,
    })
  } catch (error) {
    console.error("Error in fallback title refinement:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Fallback refinement failed: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
