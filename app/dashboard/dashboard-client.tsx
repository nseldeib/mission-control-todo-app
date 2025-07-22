"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, CheckCircle2, Clock, Plus, Star, Target, Zap } from "lucide-react"
import { WikiWidget } from "@/components/wiki-widget"
import type { Tables } from "@/lib/supabase/types"

type Todo = Tables<"todos">
type Project = Tables<"projects">
type DailyFocus = Tables<"daily_focuses">
type WikiEntry = Tables<"wiki_entries">

interface DashboardClientProps {
  todos: Todo[]
  projects: Project[]
  dailyFocuses: DailyFocus[]
  wikiEntries: WikiEntry[]
}

export default function DashboardClient({ todos, projects, dailyFocuses, wikiEntries }: DashboardClientProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  // Calculate stats
  const completedTodos = todos.filter((todo) => todo.completed).length
  const totalTodos = todos.length
  const completionRate = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0

  const highPriorityTodos = todos.filter((todo) => todo.priority === "high" && !todo.completed)
  const starredTodos = todos.filter((todo) => todo.starred && !todo.completed)
  const todaysFocus = dailyFocuses.find((focus) => focus.focus_date === new Date().toISOString().split("T")[0])

  const filteredTodos = selectedProject ? todos.filter((todo) => todo.project_id === selectedProject) : todos

  const upcomingTodos = filteredTodos
    .filter((todo) => !todo.completed)
    .sort((a, b) => {
      // Sort by priority first (high > medium > low)
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityDiff =
        priorityOrder[b.priority as keyof typeof priorityOrder] -
        priorityOrder[a.priority as keyof typeof priorityOrder]
      if (priorityDiff !== 0) return priorityDiff

      // Then by starred
      if (a.starred !== b.starred) return b.starred ? 1 : -1

      // Then by due date
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      }
      if (a.due_date) return -1
      if (b.due_date) return 1

      return 0
    })
    .slice(0, 5)

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Mission Control</h1>
            <p className="text-slate-300">Your productivity command center</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-slate-300 border-slate-600">
              <Zap className="w-3 h-3 mr-1" />
              {completedTodos} completed today
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Tasks</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalTodos}</div>
              <p className="text-xs text-slate-400">{completedTodos} completed</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Completion Rate</CardTitle>
              <Target className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{Math.round(completionRate)}%</div>
              <Progress value={completionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">High Priority</CardTitle>
              <Clock className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{highPriorityTodos.length}</div>
              <p className="text-xs text-slate-400">urgent tasks</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Projects</CardTitle>
              <Calendar className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{projects.length}</div>
              <p className="text-xs text-slate-400">active projects</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tasks and Focus */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Focus */}
            {todaysFocus && (
              <Card className="bg-gradient-to-r from-purple-800/50 to-blue-800/50 border-purple-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Today's Focus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="text-lg font-semibold text-white mb-2">{todaysFocus.title}</h3>
                  {todaysFocus.description && <p className="text-slate-300">{todaysFocus.description}</p>}
                  <div className="mt-4">
                    <Badge
                      variant={todaysFocus.completed ? "default" : "secondary"}
                      className={todaysFocus.completed ? "bg-green-600" : "bg-slate-600"}
                    >
                      {todaysFocus.completed ? "Completed" : "In Progress"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Project Filter */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Project Filter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedProject === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedProject(null)}
                    className="text-xs"
                  >
                    All Projects
                  </Button>
                  {projects.map((project) => (
                    <Button
                      key={project.id}
                      variant={selectedProject === project.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedProject(project.id)}
                      className="text-xs"
                    >
                      {project.emoji} {project.title}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Upcoming Tasks</CardTitle>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Task
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingTodos.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No upcoming tasks</p>
                  ) : (
                    upcomingTodos.map((todo) => (
                      <div
                        key={todo.id}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-colors"
                      >
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(todo.priority)}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium truncate">
                              {todo.emoji} {todo.title}
                            </span>
                            {todo.starred && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                          </div>
                          {todo.description && <p className="text-sm text-slate-400 truncate">{todo.description}</p>}
                        </div>
                        {todo.due_date && (
                          <Badge variant="outline" className="text-xs text-slate-300 border-slate-600">
                            {formatDate(todo.due_date)}
                          </Badge>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Wiki Widget */}
          <div className="space-y-6">
            <WikiWidget entries={wikiEntries} />
          </div>
        </div>
      </div>
    </div>
  )
}
