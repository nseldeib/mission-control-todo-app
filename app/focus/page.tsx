import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import FocusClient from "./focus-client"

export default async function FocusPage() {
  const supabase = createClient()

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

    // Get recent focuses (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const { data: recentFocuses } = await supabase
      .from("daily_focuses")
      .select("*")
      .eq("user_id", user.id)
      .gte("focus_date", sevenDaysAgo.toISOString().split("T")[0])
      .order("focus_date", { ascending: false })

    // Get focus completion stats
    const { data: focusStats } = await supabase
      .from("daily_focuses")
      .select("completed")
      .eq("user_id", user.id)
      .gte("focus_date", sevenDaysAgo.toISOString().split("T")[0])

    const completedCount = focusStats?.filter((f) => f.completed).length || 0
    const totalCount = focusStats?.length || 0

    return (
      <FocusClient
        user={user}
        todayFocus={todayFocus}
        recentFocuses={recentFocuses || []}
        completionStats={{
          completed: completedCount,
          total: totalCount,
          percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
        }}
      />
    )
  } catch (error) {
    console.error("Focus page error:", error)

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

    const mockRecentFocuses = [
      mockTodayFocus,
      {
        id: "focus-2",
        user_id: "demo-user-id",
        focus_date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        title: "Deep Space Learning",
        description: "Absorb new knowledge and expand cosmic understanding",
        completed: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ]

    return (
      <FocusClient
        user={mockUser}
        todayFocus={mockTodayFocus}
        recentFocuses={mockRecentFocuses}
        completionStats={{
          completed: 1,
          total: 2,
          percentage: 50,
        }}
      />
    )
  }
}
