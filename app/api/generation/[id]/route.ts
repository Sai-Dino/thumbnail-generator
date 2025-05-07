import { NextResponse } from "next/server"

// Import the jobStore from the generate route (for demo, attach to globalThis)
const jobStore = (globalThis as any).jobStore || {};

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const job = jobStore[id]
    if (!job) {
      return NextResponse.json({ success: false, status: "not_found", message: "Job not found" }, { status: 404 })
    }
    return NextResponse.json({
      success: true,
      status: job.status,
      result: job.result,
      error: job.error,
      created: job.created,
      finished: job.finished,
    })
  } catch (error) {
    console.error("Error in generation status API:", error)
    return NextResponse.json({ success: false, message: "Failed to get generation status" }, { status: 500 })
  }
}
