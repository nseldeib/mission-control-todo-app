import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./types"

// Global variable to store the singleton instance
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  // Check if we're in a preview environment (v0.dev)
  if (typeof window !== "undefined" && window.location.hostname.includes("vusercontent.net")) {
    // Return a mock client for preview environment
    return createMockClient()
  }

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

// Mock client for preview environment
function createMockClient() {
  const mockUser = {
    id: "demo-user-id",
    email: "demo@cosmictasks.app",
    user_metadata: {
      full_name: "Demo Astronaut",
    },
  }

  return {
    auth: {
      getUser: async () => ({
        data: { user: mockUser },
        error: null,
      }),
      signInWithPassword: async () => ({
        data: { user: mockUser },
        error: null,
      }),
      signUp: async () => ({
        data: { user: mockUser },
        error: null,
      }),
      signOut: async () => ({
        error: null,
      }),
    },
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => getMockData(table, "single"),
          order: (column: string, options?: any) => ({
            data: getMockData(table, "array"),
            error: null,
          }),
          data: getMockData(table, "array"),
          error: null,
        }),
        or: (filter: string) => ({
          order: (column: string, options?: any) => ({
            data: getMockData(table, "array"),
            error: null,
          }),
          data: getMockData(table, "array"),
          error: null,
        }),
        order: (column: string, options?: any) => ({
          data: getMockData(table, "array"),
          error: null,
        }),
        data: getMockData(table, "array"),
        error: null,
      }),
    }),
  }
}

function getMockData(table: string, type: "single" | "array") {
  const today = new Date().toISOString().split("T")[0]

  const mockData = {
    daily_focuses: {
      single: {
        data: {
          id: "focus-1",
          user_id: "demo-user-id",
          focus_date: today,
          title: "Master Cosmic Productivity",
          description:
            "Focus on completing high-priority mission objectives and maintaining stellar performance throughout the day",
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      },
      array: {
        data: [
          {
            id: "focus-1",
            user_id: "demo-user-id",
            focus_date: today,
            title: "Master Cosmic Productivity",
            description:
              "Focus on completing high-priority mission objectives and maintaining stellar performance throughout the day",
            completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        error: null,
      },
    },
    todos: {
      array: {
        data: [
          {
            id: "todo-1",
            user_id: "demo-user-id",
            title: "Review mission objectives",
            description: "Check today's goals and priorities",
            emoji: "🎯",
            priority: "high",
            completed: false,
            starred: true,
            due_date: today,
            project_id: "project-1",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            projects: {
              title: "Cosmic Productivity",
              color: "#6366f1",
              emoji: "🚀",
            },
          },
          {
            id: "todo-2",
            user_id: "demo-user-id",
            title: "Complete space training module",
            description: "Finish the advanced navigation course",
            emoji: "🧑‍🚀",
            priority: "medium",
            completed: false,
            starred: false,
            due_date: today,
            project_id: "project-2",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            projects: {
              title: "Learning Journey",
              color: "#8b5cf6",
              emoji: "📚",
            },
          },
          {
            id: "todo-3",
            user_id: "demo-user-id",
            title: "Morning cosmic meditation",
            description: "Center yourself for the day ahead",
            emoji: "🧘",
            priority: "low",
            completed: true,
            starred: false,
            due_date: today,
            project_id: "project-3",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            projects: {
              title: "Health & Wellness",
              color: "#10b981",
              emoji: "💪",
            },
          },
        ],
        error: null,
      },
    },
    daily_reflections: {
      single: {
        data: null,
        error: null,
      },
    },
    projects: {
      array: {
        data: [
          {
            id: "project-1",
            user_id: "demo-user-id",
            title: "Cosmic Productivity",
            description: "Master the art of space-age task management",
            emoji: "🚀",
            color: "#6366f1",
            completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "project-2",
            user_id: "demo-user-id",
            title: "Learning Journey",
            description: "Expand knowledge across the universe",
            emoji: "📚",
            color: "#8b5cf6",
            completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "project-3",
            user_id: "demo-user-id",
            title: "Health & Wellness",
            description: "Maintain astronaut-level fitness",
            emoji: "💪",
            color: "#10b981",
            completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        error: null,
      },
    },
  }

  return mockData[table as keyof typeof mockData]?.[type] || { data: null, error: null }
}

// Export the singleton instance for direct use (client-side only)
export const supabase = createClient()
