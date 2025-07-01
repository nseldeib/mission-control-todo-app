import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./types"

// Global variable to store the singleton instance
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  // If we're on the server, always create a new instance
  if (typeof window === "undefined") {
    return createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }

  // On the client, return existing instance or create new one
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }

  return supabaseInstance
}

// Export the singleton instance for direct use (client-side only)
export const supabase = createClient()
