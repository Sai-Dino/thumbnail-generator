import { NextResponse } from "next/server"
import { generateTitleSuggestions } from "@/lib/openai"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { blurb } = body

    if (!blurb || blurb.trim().length === 0) {
      return NextResponse.json({ success: false, message: "Blurb is required" }, { status: 400 })
    }

    const suggestions = await generateTitleSuggestions(blurb)

    return NextResponse.json({
      success: true,
      suggestions,
    })
  } catch (error) {
    console.error("Error in title suggestion API:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Failed to generate title suggestions: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
