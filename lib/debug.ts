// Simple debug utility
export const DEBUG_MODE = process.env.NODE_ENV === "development"

export function debugLog(...args: any[]) {
  if (DEBUG_MODE) {
    console.log("[DEBUG]", ...args)
  }
}

export function debugError(...args: any[]) {
  if (DEBUG_MODE) {
    console.error("[DEBUG ERROR]", ...args)
  }
}
