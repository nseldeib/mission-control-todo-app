import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardClient from "./dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      redirect("/login")
    }

    // Get today's date
    const today = new Date().toISOString().split("T")[0]

    // Get today's focus
    const { data: todayFocus } = await supabase
      .from("daily_focuses")
      .select("*")
      .eq("user_id", user.id)
      .eq("focus_date", today)
      .single()

    // Get today's tasks with project information
    const { data: todayTasks } = await supabase
      .from("todos")
      .select("*, projects(title, color, emoji)")
      .eq("user_id", user.id)
      .or(`due_date.eq.${today},due_date.is.null`)
      .order("created_at", { ascending: false })

    // Get today's reflection
    const { data: todayReflection } = await supabase
      .from("daily_reflections")
      .select("*")
      .eq("user_id", user.id)
      .eq("reflection_date", today)
      .single()

    // Get active projects
    const { data: projects } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .eq("completed", false)
      .order("created_at", { ascending: false })

    // Get recent wiki entries
    const { data: wikiEntries } = await supabase
      .from("wiki_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(5)

    return (
      <DashboardClient
        user={user}
        todayFocus={todayFocus}
        todayTasks={todayTasks || []}
        todayReflection={todayReflection}
        projects={projects || []}
        wikiEntries={wikiEntries || []}
      />
    )
  } catch (error) {
    console.error("Dashboard data fetch error:", error)

    // Fallback for preview environment
    const mockUser = {
      id: "demo-user-id",
      email: "demo@cosmictasks.app",
      user_metadata: { full_name: "Demo Astronaut" },
    }

    const today = new Date().toISOString().split("T")[0]
    const mockTodayFocus = {
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

    const mockTodayTasks = [
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
        todayFocus={mockTodayFocus}
        todayTasks={mockTodayTasks}
        todayReflection={null}
        projects={mockProjects}
        wikiEntries={[]}
      />
    )
  }
}
