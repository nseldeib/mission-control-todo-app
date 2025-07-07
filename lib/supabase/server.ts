import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  // Check if we're in a preview environment
  if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return createMockServerClient()
  }

  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

// Mock server client for preview environment
function createMockServerClient() {
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
    },
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => getMockServerData(table, "single"),
          order: (column: string, options?: any) => getMockServerData(table, "array"),
        }),
        or: (filter: string) => ({
          order: (column: string, options?: any) => getMockServerData(table, "array"),
        }),
        order: (column: string, options?: any) => getMockServerData(table, "array"),
      }),
    }),
  }
}

function getMockServerData(table: string, type: "single" | "array") {
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
