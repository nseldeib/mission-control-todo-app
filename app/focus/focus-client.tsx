"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Target,
  Plus,
  Edit3,
  CheckCircle,
  CalendarIcon,
  ArrowLeft,
  TrendingUp,
  Star,
  Clock,
  Rocket,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import Link from "next/link"

interface FocusClientProps {
  user: any
  todayFocus: any
  recentFocuses: any[]
  completionStats: {
    completed: number
    total: number
    percentage: number
  }
}

export default function FocusClient({ user, todayFocus, recentFocuses, completionStats }: FocusClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: todayFocus?.title || "",
    description: todayFocus?.description || "",
  })

  const today = new Date().toISOString().split("T")[0]
  const isToday = selectedDate.toISOString().split("T")[0] === today

  const handleCreateFocus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setIsLoading(true)
    try {
      const focusDate = selectedDate.toISOString().split("T")[0]

      const { error } = await supabase.from("daily_focuses").insert({
        user_id: user.id,
        focus_date: focusDate,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        completed: false,
      })

      if (!error) {
        setIsCreating(false)
        setFormData({ title: "", description: "" })
        router.refresh()
      }
    } catch (error) {
      console.error("Error creating focus:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateFocus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !todayFocus) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("daily_focuses")
        .update({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", todayFocus.id)

      if (!error) {
        setIsEditing(false)
        router.refresh()
      }
    } catch (error) {
      console.error("Error updating focus:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleComplete = async () => {
    if (!todayFocus) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("daily_focuses")
        .update({
          completed: !todayFocus.completed,
          completed_at: !todayFocus.completed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", todayFocus.id)

      if (!error) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error toggling focus completion:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedFocus = recentFocuses.find((focus) => focus.focus_date === selectedDate.toISOString().split("T")[0])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-space-black-lighter bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-space-purple animate-pulse" />
              <span className="text-2xl font-bold bg-gradient-to-r from-space-purple to-space-blue bg-clip-text text-transparent">
                Daily Focus
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Astronaut"}
            </span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Today's Focus */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Focus Card */}
            <Card className="bg-gradient-to-r from-space-purple/20 to-space-blue/20 border-space-purple">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-6 w-6 text-space-purple" />
                    <CardTitle className="text-space-purple">{format(new Date(), "EEEE, MMMM d, yyyy")}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    {todayFocus && (
                      <Button
                        onClick={handleToggleComplete}
                        disabled={isLoading}
                        variant={todayFocus.completed ? "default" : "outline"}
                        size="sm"
                        className={
                          todayFocus.completed ? "bg-space-green text-white" : "border-space-green text-space-green"
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {todayFocus.completed ? "Completed" : "Mark Complete"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {todayFocus ? (
                  <div className="space-y-4">
                    {isEditing ? (
                      <form onSubmit={handleUpdateFocus} className="space-y-4">
                        <div>
                          <Label htmlFor="title">Focus Title</Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="What's your main focus today?"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description (Optional)</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Add more details about your focus..."
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button type="submit" disabled={isLoading || !formData.title.trim()}>
                            {isLoading ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false)
                              setFormData({
                                title: todayFocus.title,
                                description: todayFocus.description || "",
                              })
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">{todayFocus.title}</h3>
                            {todayFocus.description && (
                              <p className="text-muted-foreground">{todayFocus.description}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setIsEditing(true)
                              setFormData({
                                title: todayFocus.title,
                                description: todayFocus.description || "",
                              })
                            }}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant={todayFocus.completed ? "default" : "secondary"}>
                            {todayFocus.completed ? "Completed" : "In Progress"}
                          </Badge>
                          {todayFocus.completed && todayFocus.completed_at && (
                            <span className="text-sm text-muted-foreground">
                              Completed at {format(new Date(todayFocus.completed_at), "h:mm a")}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No focus set for today</p>
                    <Dialog open={isCreating} onOpenChange={setIsCreating}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-space-purple to-space-blue">
                          <Plus className="h-4 w-4 mr-2" />
                          Set Today's Focus
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Set Your Daily Focus</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateFocus} className="space-y-4">
                          <div>
                            <Label htmlFor="new-title">Focus Title</Label>
                            <Input
                              id="new-title"
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              placeholder="What's your main focus today?"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="new-description">Description (Optional)</Label>
                            <Textarea
                              id="new-description"
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              placeholder="Add more details about your focus..."
                              className="mt-1"
                              rows={3}
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button type="submit" disabled={isLoading || !formData.title.trim()}>
                              {isLoading ? "Creating..." : "Set Focus"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsCreating(false)
                                setFormData({ title: "", description: "" })
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Focus History */}
            <Card className="bg-card/50 backdrop-blur-sm border-space-black-lighter">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-6 w-6 text-space-blue" />
                    <CardTitle className="text-space-blue">Recent Focus History</CardTitle>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {format(selectedDate, "MMM d")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardHeader>
              <CardContent>
                {recentFocuses.length > 0 ? (
                  <div className="space-y-3">
                    {recentFocuses.map((focus) => (
                      <div
                        key={focus.id}
                        className={`p-3 rounded-lg border transition-colors ${
                          focus.focus_date === selectedDate.toISOString().split("T")[0]
                            ? "border-space-purple bg-space-purple/10"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium">
                                {format(new Date(focus.focus_date), "MMM d, yyyy")}
                              </span>
                              {focus.focus_date === today && (
                                <Badge variant="outline" className="text-xs">
                                  Today
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-medium">{focus.title}</h4>
                            {focus.description && (
                              <p className="text-sm text-muted-foreground mt-1">{focus.description}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {focus.completed ? (
                              <CheckCircle className="h-5 w-5 text-space-green" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No focus history yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats & Quick Actions */}
          <div className="space-y-6">
            {/* Focus Stats */}
            <Card className="bg-card/50 backdrop-blur-sm border-space-black-lighter">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6 text-space-green" />
                  <CardTitle className="text-space-green">Focus Performance</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-space-green mb-2">{completionStats.percentage}%</div>
                  <p className="text-sm text-muted-foreground">Completion Rate (Last 7 Days)</p>
                </div>
                <Progress value={completionStats.percentage} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed: {completionStats.completed}</span>
                  <span className="text-muted-foreground">Total: {completionStats.total}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-card/50 backdrop-blur-sm border-space-black-lighter">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {!todayFocus && (
                  <Dialog open={isCreating} onOpenChange={setIsCreating}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start">
                        <Plus className="h-4 w-4 mr-2" />
                        Set Today's Focus
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Set Your Daily Focus</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateFocus} className="space-y-4">
                        <div>
                          <Label htmlFor="quick-title">Focus Title</Label>
                          <Input
                            id="quick-title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="What's your main focus today?"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="quick-description">Description (Optional)</Label>
                          <Textarea
                            id="quick-description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Add more details about your focus..."
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button type="submit" disabled={isLoading || !formData.title.trim()}>
                            {isLoading ? "Creating..." : "Set Focus"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsCreating(false)
                              setFormData({ title: "", description: "" })
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
                <Link href="/dashboard" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <Rocket className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <Link href="/tasks" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    View Tasks
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Focus Tips */}
            <Card className="bg-gradient-to-r from-space-gold/20 to-space-green/20 border-space-gold">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Star className="h-6 w-6 text-space-gold" />
                  <CardTitle className="text-space-gold">Focus Tips</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p>🎯 Choose one main objective per day</p>
                  <p>🚀 Make it specific and actionable</p>
                  <p>⭐ Break large goals into smaller steps</p>
                  <p>🧘 Review and adjust as needed</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
