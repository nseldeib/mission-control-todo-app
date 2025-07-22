import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./types"

export function createClient() {
  // Check if we're in a preview environment
  const isPreview = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (isPreview) {
    // Return a mock client for preview environment
    return createMockClient()
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

function createMockClient() {
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
      signInWithPassword: async (credentials: any) => ({
        data: {
          user: mockUser,
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
      signUp: async (credentials: any) => ({
        data: {
          user: mockUser,
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
      signOut: async () => ({
        error: null,
      }),
    },
    from: (table: string) => ({
      select: (columns?: string) => createMockQueryBuilder(table, columns),
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

function createMockQueryBuilder(table: string, columns?: string) {
  const queryBuilder = {
    eq: (column: string, value: any) => {
      const newBuilder = { ...queryBuilder }
      newBuilder.eq = (column2: string, value2: any) => {
        if (table === "daily_focuses" || table === "daily_reflections") {
          return {
            single: async () => getMockData(table, "single"),
          }
        }
        return {
          order: (column: string, options?: any) => ({
            data: getMockData(table, "array").data,
            error: null,
          }),
        }
      }
      return newBuilder
    },
    gte: (column: string, value: any) => ({
      order: (column: string, options?: any) => ({
        data: getMockData(table, "array").data,
        error: null,
      }),
    }),
    or: (filter: string) => ({
      order: (column: string, options?: any) => ({
        data: getMockData(table, "array").data,
        error: null,
      }),
    }),
    order: (column: string, options?: any) => ({
      data: getMockData(table, "array").data,
      error: null,
    }),
    single: async () => getMockData(table, "single"),
  }

  return queryBuilder
}

function getMockData(table: string, type: "single" | "array") {
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
    wiki_entries: {
      single: {
        data: null,
        error: null,
      },
      array: {
        data: [
          {
            id: "wiki-1",
            user_id: "demo-user-id",
            title: "Productivity System",
            summary: "My personal productivity methodology and tools",
            content:
              "# Productivity System\n\nThis is my comprehensive approach to staying productive and organized in both work and personal life.\n\n## Core Principles\n\n1. **Capture Everything** - Use a trusted system to capture all tasks, ideas, and commitments\n2. **Process Regularly** - Review and organize captured items daily\n3. **Focus on Outcomes** - Always connect tasks to larger goals and outcomes\n\n## Tools & Methods\n\n- Getting Things Done (GTD) methodology\n- Time blocking for deep work\n- Weekly and monthly reviews\n- Digital task management with analog backup\n\n## Key Habits\n\n- Morning planning session (15 minutes)\n- End-of-day review (10 minutes)\n- Weekly review (30 minutes)\n- Monthly goal assessment (1 hour)",
            tags: ["productivity", "system", "gtd", "organization"],
            category: "work",
            status: "published",
            priority: "high",
            is_public: false,
            rating: 5,
            file_urls: [],
            related_links: ["https://gettingthingsdone.com", "https://todoist.com/productivity-methods"],
            created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
            updated_at: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: "wiki-2",
            user_id: "demo-user-id",
            title: "Learning Resources",
            summary: "Curated list of learning materials and courses across different topics",
            content:
              "# Learning Resources\n\nA comprehensive collection of learning materials, courses, and resources I've found valuable.\n\n## Programming & Development\n\n### JavaScript/TypeScript\n- **Course**: The Complete JavaScript Course (Jonas Schmedtmann)\n- **Book**: You Don't Know JS series\n- **Practice**: LeetCode, HackerRank\n\n### React/Next.js\n- **Documentation**: Official React docs\n- **Course**: React - The Complete Guide (Maximilian Schwarzmüller)\n- **Practice**: Build projects, contribute to open source\n\n## Design\n\n### UI/UX\n- **Course**: Design for Developers (Gary Simon)\n- **Tool**: Figma for prototyping\n- **Inspiration**: Dribbble, Behance\n\n## Productivity & Business\n\n### Books\n- Getting Things Done by David Allen\n- Deep Work by Cal Newport\n- The Lean Startup by Eric Ries\n\n### Courses\n- Building a Second Brain (Tiago Forte)\n- The Complete Digital Marketing Course",
            tags: ["learning", "resources", "education", "development", "design"],
            category: "learning",
            status: "draft",
            priority: "medium",
            is_public: true,
            rating: 4,
            file_urls: [],
            related_links: ["https://javascript.info", "https://react.dev", "https://nextjs.org/learn"],
            created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
            updated_at: new Date(Date.now() - 7200000).toISOString(),
          },
          {
            id: "wiki-3",
            user_id: "demo-user-id",
            title: "Project Ideas",
            summary: "Collection of project ideas and concepts to explore",
            content:
              "# Project Ideas\n\nA running list of project ideas, concepts, and things I want to build or explore.\n\n## Web Applications\n\n### Personal Finance Tracker\n- **Concept**: Simple expense tracking with categorization\n- **Tech Stack**: Next.js, Supabase, Recharts\n- **Features**: \n  - Expense categorization\n  - Monthly/yearly reports\n  - Budget tracking\n  - Receipt photo upload\n\n### Habit Tracker\n- **Concept**: Visual habit tracking with streaks\n- **Tech Stack**: React Native, SQLite\n- **Features**:\n  - Daily check-ins\n  - Streak visualization\n  - Progress analytics\n  - Reminder notifications\n\n## Learning Projects\n\n### AI Chat Assistant\n- **Concept**: Personal AI assistant for productivity\n- **Tech Stack**: OpenAI API, Vector DB, Next.js\n- **Features**:\n  - Document Q&A\n  - Task management integration\n  - Calendar scheduling\n\n### Code Snippet Manager\n- **Concept**: Personal code snippet library\n- **Tech Stack**: Electron, Monaco Editor\n- **Features**:\n  - Syntax highlighting\n  - Tag-based organization\n  - Search functionality\n  - Export/import",
            tags: ["projects", "ideas", "development", "planning"],
            category: "ideas",
            status: "published",
            priority: "low",
            is_public: false,
            rating: 3,
            file_urls: [],
            related_links: [],
            created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
            updated_at: new Date(Date.now() - 1800000).toISOString(),
          },
        ],
        error: null,
      },
    },
  }

  return mockData[table as keyof typeof mockData]?.[type] || { data: null, error: null }
}
