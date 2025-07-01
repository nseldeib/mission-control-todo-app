"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Rocket, Target, Plus, CheckCircle, BookOpen, LogOut, Settings, BarChart3, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface DashboardClientProps {
  user: any
  todayFocus: any
  todayTasks: any[]
  todayReflection: any
  projects: any[]
}

export default function DashboardClient({
  user,
  todayFocus,
  todayTasks = [],
  todayReflection,
  projects = [],
}: DashboardClientProps) {
  const router = useRouter()

  // Get the singleton client instance
  const supabase = createClient()

  // Safely handle tasks data
  const safeTasks = Array.isArray(todayTasks) ? todayTasks : []
  const safeProjects = Array.isArray(projects) ? projects : []

  const completedTasks = safeTasks.filter((task) => task?.completed)
  const completionRate = safeTasks.length > 0 ? (completedTasks.length / safeTasks.length) * 100 : 0

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      // Force redirect to ensure clean logout
      window.location.href = "/"
    } catch (error) {
      console.error("Sign out error:", error)
      // Force redirect even if sign out fails
      window.location.href = "/"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (task: any) => {
    if (!task) return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />

    if (task.completed) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    if (task.starred) {
      return <Star className="h-4 w-4 text-yellow-500 fill-current" />
    }
    return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
  }

  // Filter tasks for today (due today or overdue) with safety checks
  const todayDate = new Date().toISOString().split("T")[0]
  const todaysRelevantTasks = safeTasks.filter((task) => {
    if (!task) return false
    if (!task.due_date) return !task.completed // Show incomplete tasks without due dates
    const taskDate = new Date(task.due_date).toISOString().split("T")[0]
    return taskDate <= todayDate || !task.completed
  })

  // Safe user name extraction
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Astronaut"

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-space-black-lighter bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Rocket className="h-8 w-8 text-space-purple animate-float" />
            <span className="text-2xl font-bold bg-gradient-to-r from-space-purple to-space-blue bg-clip-text text-transparent">
              Mission Control
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Welcome back, {userName}</span>
            <Link href="/analytics">
              <Button variant="ghost" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-space-purple to-space-blue bg-clip-text text-transparent">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h1>
          <p className="text-muted-foreground">Ready to make today cosmic?</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Focus & Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Focus */}
            <Card className="bg-gradient-to-r from-space-purple/20 to-space-blue/20 border-space-purple">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-6 w-6 text-space-purple" />
                    <CardTitle className="text-space-purple">Today's Focus</CardTitle>
                  </div>
                  {!todayFocus && (
                    <Link href="/focus">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-space-purple text-space-purple bg-transparent"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Set Focus
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {todayFocus ? (
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">{todayFocus.title}</h3>
                    {todayFocus.description && <p className="text-muted-foreground">{todayFocus.description}</p>}
                    <div className="flex items-center space-x-2">
                      <Badge variant={todayFocus.completed ? "default" : "secondary"}>
                        {todayFocus.completed ? "Completed" : "In Progress"}
                      </Badge>
                      {!todayFocus.completed && (
                        <Link href="/focus">
                          <Button size="sm" variant="ghost" className="text-space-purple">
                            Mark Complete
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No focus set for today</p>
                    <Link href="/focus">
                      <Button className="bg-gradient-to-r from-space-purple to-space-blue">
                        <Plus className="h-4 w-4 mr-2" />
                        Set Your Daily Focus
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Today's Tasks */}
            <Card className="bg-card/50 backdrop-blur-sm border-space-black-lighter">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-6 w-6 text-space-blue" />
                    <CardTitle className="text-space-blue">Today's Tasks</CardTitle>
                    <Badge variant="secondary">{todaysRelevantTasks.length}</Badge>
                  </div>
                  <Link href="/tasks">
                    <Button size="sm" variant="outline" className="border-space-blue text-space-blue bg-transparent">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {todaysRelevantTasks.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-muted-foreground">
                        {todaysRelevantTasks.filter((t) => t?.completed).length} of {todaysRelevantTasks.length}{" "}
                        completed
                      </span>
                    </div>
                    <Progress
                      value={
                        todaysRelevantTasks.length > 0
                          ? (todaysRelevantTasks.filter((t) => t?.completed).length / todaysRelevantTasks.length) * 100
                          : 0
                      }
                      className="h-2"
                    />

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {todaysRelevantTasks.slice(0, 5).map((task, index) => (
                        <div
                          key={task?.id || index}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50"
                        >
                          {getStatusIcon(task)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              {task?.emoji && <span className="text-sm">{task.emoji}</span>}
                              <p
                                className={`text-sm font-medium truncate ${
                                  task?.completed ? "line-through text-muted-foreground" : ""
                                }`}
                              >
                                {task?.title || "Untitled Task"}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              {task?.priority && (
                                <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                              )}
                              {task?.projects && (
                                <Badge variant="outline" className="text-xs" style={{ color: task.projects.color }}>
                                  {task.projects.emoji} {task.projects.title}
                                </Badge>
                              )}
                              {task?.due_date && (
                                <span className="text-xs text-muted-foreground">
                                  Due: {new Date(task.due_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {todaysRelevantTasks.length > 5 && (
                      <Link href="/tasks">
                        <Button variant="ghost" className="w-full text-space-blue">
                          View All Tasks ({todaysRelevantTasks.length - 5} more)
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No tasks for today</p>
                    <Link href="/tasks">
                      <Button className="bg-gradient-to-r from-space-blue to-space-purple">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Task
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats & Reflection */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-card/50 backdrop-blur-sm border-space-black-lighter">
              <CardHeader>
                <CardTitle className="text-space-green">Mission Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Focus Status</span>
                  <Badge variant={todayFocus?.completed ? "default" : "secondary"}>
                    {todayFocus?.completed ? "Complete" : todayFocus ? "Active" : "Not Set"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tasks Completed</span>
                  <span className="font-semibold text-space-green">
                    {todaysRelevantTasks.filter((t) => t?.completed).length}/{todaysRelevantTasks.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Projects</span>
                  <span className="font-semibold text-space-blue">{safeProjects.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Daily Reflection */}
            <Card className="bg-card/50 backdrop-blur-sm border-space-black-lighter">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-6 w-6 text-space-gold" />
                    <CardTitle className="text-space-gold">Daily Reflection</CardTitle>
                  </div>
                  {!todayReflection && (
                    <Link href="/reflections">
                      <Button size="sm" variant="outline" className="border-space-gold text-space-gold bg-transparent">
                        Reflect
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {todayReflection ? (
                  <div className="space-y-3">
                    <Badge variant="default" className="bg-space-gold">
                      Reflection Complete
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      You've completed today's reflection. Great job on staying mindful of your progress!
                    </p>
                    <Link href="/reflections">
                      <Button variant="ghost" size="sm" className="text-space-gold">
                        View Reflection
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">End your day with reflection</p>
                    <Link href="/reflections">
                      <Button size="sm" className="bg-gradient-to-r from-space-gold to-space-green">
                        Start Reflection
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Projects */}
            <Card className="bg-card/50 backdrop-blur-sm border-space-black-lighter">
              <CardHeader>
                <CardTitle>Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {safeProjects.length > 0 ? (
                  <div className="space-y-2">
                    {safeProjects.slice(0, 3).map((project, index) => (
                      <div
                        key={project?.id || index}
                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50"
                      >
                        <span className="text-lg">{project?.emoji || "📁"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: project?.color || "#6366f1" }}>
                            {project?.title || "Untitled Project"}
                          </p>
                        </div>
                      </div>
                    ))}
                    {safeProjects.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{safeProjects.length - 3} more projects
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">No active projects</p>
                    <Link href="/projects">
                      <Button size="sm" variant="outline">
                        Create Project
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-card/50 backdrop-blur-sm border-space-black-lighter">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/tasks" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Task
                  </Button>
                </Link>
                <Link href="/focus" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    {todayFocus ? "Update Focus" : "Set Daily Focus"}
                  </Button>
                </Link>
                <Link href="/reflections" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Daily Reflection
                  </Button>
                </Link>
                <Link href="/analytics" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
