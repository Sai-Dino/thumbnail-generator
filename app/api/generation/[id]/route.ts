import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // In a real implementation, this would:
    // 1. Check the status of the generation in the database
    // 2. Return the appropriate status and URLs if ready

    // Mock response
    return NextResponse.json({
      success: true,
      status: "ready",
      previewUrl:
        "/placeholder.svg?height=720&width=1280&query=professional podcast thumbnail with two faces and title",
      downloadUrls: {
        thumbnail:
          "/placeholder.svg?height=720&width=1280&query=professional podcast thumbnail with two faces and title",
        showArt: "/placeholder.svg?height=3000&width=3000&query=square podcast artwork with faces and title",
        layered: "#",
      },
    })
  } catch (error) {
    console.error("Error in generation status API:", error)
    return NextResponse.json({ success: false, message: "Failed to get generation status" }, { status: 500 })
  }
}
