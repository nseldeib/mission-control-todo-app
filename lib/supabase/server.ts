import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "./types"

export async function createClient() {
  // Check if we're in a preview environment
  const isPreview = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (isPreview) {
    // Return a mock server client for preview environment
    return createMockServerClient()
  }

  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  )
}

function createMockServerClient() {
  const mockUser = {
    id: "demo-user-id",
    email: "demo@cosmictasks.app",
    user_metadata: {
      full_name: "Demo Astronaut",
    },
    aud: "authenticated",
    role: "authenticated",
    email_confirmed_at: new Date().toISOString(),
    phone_confirmed_at: null,
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: {
      provider: "email",
      providers: ["email"],
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return {
    auth: {
      getUser: async () => ({
        data: { user: mockUser },
        error: null,
      }),
      getSession: async () => ({
        data: {
          session: {
            access_token: "mock-token",
            refresh_token: "mock-refresh-token",
            expires_in: 3600,
            expires_at: Date.now() + 3600000,
            token_type: "bearer",
            user: mockUser,
          },
        },
        error: null,
      }),
    },
    from: (table: string) => ({
      select: (columns?: string) => createMockServerQueryBuilder(table, columns),
      insert: (data: any) => ({
        select: (columns?: string) => ({
          single: async () => ({
            data: {
              ...data,
              id: `mock-${Date.now()}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
        error: null,
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: (columns?: string) => ({
            single: async () => ({
              data: { ...data, id: value, updated_at: new Date().toISOString() },
              error: null,
            }),
          }),
          error: null,
        }),
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          error: null,
        }),
      }),
    }),
  }
}

function createMockServerQueryBuilder(table: string, columns?: string) {
  const queryBuilder = {
    eq: (column: string, value: any) => {
      const newBuilder = { ...queryBuilder }
      newBuilder.eq = (column2: string, value2: any) => {
        if (table === "daily_focuses" || table === "daily_reflections") {
          return {
            single: async () => getMockServerData(table, "single"),
          }
        }
        return {
          order: (column: string, options?: any) => ({
            data: getMockServerData(table, "array").data,
            error: null,
          }),
        }
      }
      return newBuilder
    },
    gte: (column: string, value: any) => ({
      order: (column: string, options?: any) => ({
        data: getMockServerData(table, "array").data,
        error: null,
      }),
    }),
    or: (filter: string) => ({
      order: (column: string, options?: any) => ({
        data: getMockServerData(table, "array").data,
        error: null,
      }),
    }),
    order: (column: string, options?: any) => ({
      data: getMockServerData(table, "array").data,
      error: null,
    }),
    single: async () => getMockServerData(table, "single"),
  }

  return queryBuilder
}

function getMockServerData(table: string, type: "single" | "array") {
  const today = new Date().toISOString().split("T")[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

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
          completed_at: null,
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
            completed_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "focus-2",
            user_id: "demo-user-id",
            focus_date: yesterday,
            title: "Deep Space Learning",
            description: "Absorb new knowledge and expand cosmic understanding",
            completed: true,
            completed_at: new Date(Date.now() - 3600000).toISOString(),
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
        error: null,
      },
    },
    todos: {
      single: {
        data: null,
        error: null,
      },
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
        ],
        error: null,
      },
    },
    daily_reflections: {
      single: {
        data: null,
        error: null,
      },
      array: {
        data: [],
        error: null,
      },
    },
    projects: {
      single: {
        data: null,
        error: null,
      },
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
        ],
        error: null,
      },
    },
  }

  return mockData[table as keyof typeof mockData]?.[type] || { data: null, error: null }
}
