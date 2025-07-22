import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardClient from "./dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch all data in parallel
  const [{ data: todos }, { data: projects }, { data: dailyFocuses }, { data: wikiEntries }] = await Promise.all([
    supabase.from("todos").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("projects").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase
      .from("daily_focuses")
      .select("*")
      .eq("user_id", user.id)
      .order("focus_date", { ascending: false })
      .limit(7),
    supabase.from("wiki_entries").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
  ])

  return (
    <DashboardClient
      todos={todos || []}
      projects={projects || []}
      dailyFocuses={dailyFocuses || []}
      wikiEntries={wikiEntries || []}
    />
  )
}
