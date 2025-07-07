import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardClient from "./dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()

  try {
    // Check authentication first
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Auth error:", authError)
      // Only redirect in production environment
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        redirect("/login")
      }
      // In preview environment, continue with mock user
      const mockUser = {
        id: "demo-user-id",
        email: "demo@cosmictasks.app",
        user_metadata: {
          full_name: "Demo Astronaut",
        },
      }

      // Get mock data for preview
      const today = new Date().toISOString().split("T")[0]
      const mockFocus = {
        id: "focus-1",
        user_id: "demo-user-id",
        focus_date: today,
        title: "Master Cosmic Productivity",
        description:
          "Focus on completing high-priority mission objectives and maintaining stellar performance throughout the day",
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const mockTasks = [
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
      ]

      const mockProjects = [
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
      ]

      return (
        <DashboardClient
          user={mockUser}
          todayFocus={mockFocus}
          todayTasks={mockTasks}
          todayReflection={null}
          projects={mockProjects}
        />
      )
    }

    // Get today's date
    const today = new Date().toISOString().split("T")[0]

    // Fetch data with error handling for each query
    const [focusResult, tasksResult, reflectionResult, projectsResult] = await Promise.allSettled([
      supabase.from("daily_focuses").select("*").eq("user_id", user.id).eq("focus_date", today).single(),
      supabase
        .from("todos")
        .select("*, projects(title, color, emoji)")
        .eq("user_id", user.id)
        .or(`due_date.gte.${today}T00:00:00,completed.eq.false`)
        .order("created_at", { ascending: false }),
      supabase.from("daily_reflections").select("*").eq("user_id", user.id).eq("reflection_date", today).single(),
      supabase.from("projects").select("*").eq("user_id", user.id).eq("completed", false).order("title"),
    ])

    // Extract data with fallbacks
    const todayFocus = focusResult.status === "fulfilled" ? focusResult.value.data : null
    const todayTasks = tasksResult.status === "fulfilled" ? tasksResult.value.data || [] : []
    const todayReflection = reflectionResult.status === "fulfilled" ? reflectionResult.value.data : null
    const projects = projectsResult.status === "fulfilled" ? projectsResult.value.data || [] : []

    // Log any errors for debugging
    if (focusResult.status === "rejected") {
      console.log("Focus query error:", focusResult.reason)
    }
    if (tasksResult.status === "rejected") {
      console.log("Tasks query error:", tasksResult.reason)
    }
    if (reflectionResult.status === "rejected") {
      console.log("Reflection query error:", reflectionResult.reason)
    }
    if (projectsResult.status === "rejected") {
      console.log("Projects query error:", projectsResult.reason)
    }

    return (
      <DashboardClient
        user={user}
        todayFocus={todayFocus}
        todayTasks={todayTasks}
        todayReflection={todayReflection}
        projects={projects}
      />
    )
  } catch (error) {
    console.error("Dashboard data fetch error:", error)

    // Return dashboard with mock data if there's a critical error
    const mockUser = {
      id: "demo-user-id",
      email: "demo@cosmictasks.app",
      user_metadata: {
        full_name: "Demo Astronaut",
      },
    }

    return <DashboardClient user={mockUser} todayFocus={null} todayTasks={[]} todayReflection={null} projects={[]} />
  }
}
