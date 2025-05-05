import { NextResponse } from "next/server"
import { refineTitle } from "@/lib/openai"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { original } = body

    if (!original || original.trim().length === 0) {
      return NextResponse.json({ success: false, message: "Original title is required" }, { status: 400 })
    }

    // Add more detailed logging
    console.log("Refining title:", original)

    const refined = await refineTitle(original)

    console.log("Refined title result:", refined)

    return NextResponse.json({
      success: true,
      original,
      refined,
    })
  } catch (error) {
    // Improved error logging
    console.error("Error in title refinement API:", error)

    // Return a more detailed error response
    return NextResponse.json(
      {
        success: false,
        message: `Failed to refine title: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
