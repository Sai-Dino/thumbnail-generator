import { NextResponse } from "next/server"
import { uploadToBlob } from "@/lib/blob-storage"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const prefix = (formData.get("prefix") as string) || "upload"

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 })
    }

    // Upload to Vercel Blob
    const url = await uploadToBlob(file, prefix)

    return NextResponse.json({
      success: true,
      url,
      filename: file.name,
    })
  } catch (error) {
    console.error("Error in upload API:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Failed to upload file: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
