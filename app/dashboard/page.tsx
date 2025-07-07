import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardClient from "./dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Check authentication first
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error("Auth error:", authError)
    // In preview environment, don't redirect, just show with mock data
    if (typeof window !== "undefined" && window.location.hostname.includes("vusercontent.net")) {
      const mockUser = {
        id: "demo-user-id",
        email: "demo@cosmictasks.app",
        user_metadata: {
          full_name: "Demo Astronaut",
        },
      }
      return <DashboardClient user={mockUser} todayFocus={null} todayTasks={[]} todayReflection={null} projects={[]} />
    }
    redirect("/login")
  }

  // Get today's date
  const today = new Date().toISOString().split("T")[0]

  try {
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

    // Return dashboard with empty data if there's a critical error
    return <DashboardClient user={user} todayFocus={null} todayTasks={[]} todayReflection={null} projects={[]} />
  }
}
