"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Star,
  Eye,
  EyeOff,
  Link,
  Upload,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { WikiEntry } from "@/lib/supabase/types"

interface WikiWidgetProps {
  entries: WikiEntry[]
}

const CATEGORIES = ["general", "work", "personal", "learning", "reference", "ideas", "projects"]

const STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-500" },
  { value: "published", label: "Published", color: "bg-green-500" },
  { value: "archived", label: "Archived", color: "bg-slate-500" },
]

const PRIORITIES = [
  { value: "low", label: "Low", color: "bg-green-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "high", label: "High", color: "bg-red-500" },
]

export function WikiWidget({ entries: initialEntries }: WikiWidgetProps) {
  const [entries, setEntries] = useState<WikiEntry[]>(initialEntries)
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [filters, setFilters] = useState({
    category: "general",
    status: "draft",
    visibility: "all",
    tag: "",
  })

  const supabase = createClient()

  // Filter entries based on current filters
  const filteredEntries = entries.filter((entry) => {
    if (filters.category !== "all" && entry.category !== filters.category) return false
    if (filters.status !== "all" && entry.status !== filters.status) return false
    if (filters.visibility !== "all") {
      const isPublic = filters.visibility === "public"
      if (entry.is_public !== isPublic) return false
    }
    if (filters.tag && !entry.tags.some((tag) => tag.toLowerCase().includes(filters.tag.toLowerCase()))) return false
    return true
  })

  const toggleExpanded = (entryId: string) => {
    const newExpanded = new Set(expandedEntries)
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId)
    } else {
      newExpanded.add(entryId)
    }
    setExpandedEntries(newExpanded)
  }

  const startEditing = (entryId: string) => {
    setEditingEntry(entryId)
    setExpandedEntries((prev) => new Set([...prev, entryId]))
  }

  const cancelEditing = () => {
    setEditingEntry(null)
    setIsCreating(false)
  }

  const saveEntry = async (entry: Partial<WikiEntry>) => {
    try {
      if (entry.id) {
        // Update existing entry
        const { data, error } = await supabase.from("wiki_entries").update(entry).eq("id", entry.id).select().single()

        if (error) throw error

        setEntries((prev) => prev.map((e) => (e.id === entry.id ? data : e)))
      } else {
        // Create new entry
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error("Not authenticated")

        const { data, error } = await supabase
          .from("wiki_entries")
          .insert({ ...entry, user_id: user.id })
          .select()
          .single()

        if (error) throw error

        setEntries((prev) => [data, ...prev])
        setIsCreating(false)
      }

      setEditingEntry(null)
    } catch (error) {
      console.error("Error saving entry:", error)
    }
  }

  const deleteEntry = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return

    try {
      const { error } = await supabase.from("wiki_entries").delete().eq("id", entryId)

      if (error) throw error

      setEntries((prev) => prev.filter((e) => e.id !== entryId))
      setExpandedEntries((prev) => {
        const newSet = new Set(prev)
        newSet.delete(entryId)
        return newSet
      })
    } catch (error) {
      console.error("Error deleting entry:", error)
    }
  }

  const renderStars = (rating: number | null) => {
    if (!rating) return null
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={`w-3 h-3 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-400"}`} />
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Personal Wiki
          </CardTitle>
          <Button size="sm" onClick={() => setIsCreating(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-1" />
            New Entry
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Select
            value={filters.category}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
          >
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.visibility}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, visibility: value }))}
          >
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Filter by tag..."
            value={filters.tag}
            onChange={(e) => setFilters((prev) => ({ ...prev, tag: e.target.value }))}
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
          />
        </div>
      </CardHeader>

      <CardContent className="max-h-96 overflow-y-auto space-y-3">
        {/* Create New Entry Form */}
        {isCreating && <WikiEntryForm entry={null} onSave={saveEntry} onCancel={cancelEditing} />}

        {/* Entries List */}
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No wiki entries found</p>
            <p className="text-sm">Create your first entry to get started</p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div key={entry.id} className="border border-slate-600 rounded-lg bg-slate-700/30">
              {/* Entry Header */}
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <button onClick={() => toggleExpanded(entry.id)} className="text-slate-300 hover:text-white">
                        {expandedEntries.has(entry.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      <h3 className="font-medium text-white truncate">{entry.title}</h3>
                      {entry.is_public ? (
                        <Eye className="w-4 h-4 text-green-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-slate-400" />
                      )}
                    </div>

                    {entry.summary && <p className="text-sm text-slate-300 truncate ml-6">{entry.summary}</p>}

                    <div className="flex items-center space-x-2 mt-2 ml-6">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          STATUSES.find((s) => s.value === entry.status)?.color
                        } text-white border-0`}
                      >
                        {STATUSES.find((s) => s.value === entry.status)?.label}
                      </Badge>

                      <Badge variant="outline" className="text-xs text-slate-300 border-slate-600">
                        {entry.category}
                      </Badge>

                      <div
                        className={`w-2 h-2 rounded-full ${PRIORITIES.find((p) => p.value === entry.priority)?.color}`}
                      />

                      {renderStars(entry.rating)}

                      <span className="text-xs text-slate-400">{formatDate(entry.updated_at)}</span>
                    </div>

                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2 ml-6">
                        {entry.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEditing(entry.id)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteEntry(entry.id)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedEntries.has(entry.id) && (
                <div className="border-t border-slate-600 p-3">
                  {editingEntry === entry.id ? (
                    <WikiEntryForm entry={entry} onSave={saveEntry} onCancel={cancelEditing} />
                  ) : (
                    <div className="space-y-3">
                      {entry.content && (
                        <div className="text-sm text-slate-300 whitespace-pre-wrap">{entry.content}</div>
                      )}

                      {entry.related_links.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-white mb-2">Related Links</h4>
                          <div className="space-y-1">
                            {entry.related_links.map((link, index) => (
                              <a
                                key={index}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-sm text-blue-400 hover:text-blue-300"
                              >
                                <Link className="w-3 h-3 mr-1" />
                                {link}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {entry.file_urls.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-white mb-2">Files</h4>
                          <div className="space-y-1">
                            {entry.file_urls.map((url, index) => (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-sm text-green-400 hover:text-green-300"
                              >
                                <Upload className="w-3 h-3 mr-1" />
                                File {index + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

interface WikiEntryFormProps {
  entry: WikiEntry | null
  onSave: (entry: Partial<WikiEntry>) => void
  onCancel: () => void
}

function WikiEntryForm({ entry, onSave, onCancel }: WikiEntryFormProps) {
  const [formData, setFormData] = useState({
    title: entry?.title || "",
    summary: entry?.summary || "",
    content: entry?.content || "",
    category: entry?.category || "general",
    status: entry?.status || "draft",
    priority: entry?.priority || "medium",
    is_public: entry?.is_public || false,
    rating: entry?.rating || null,
    tags: entry?.tags || [],
    related_links: entry?.related_links || [],
    file_urls: entry?.file_urls || [],
  })

  const [newTag, setNewTag] = useState("")
  const [newLink, setNewLink] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      ...(entry && { id: entry.id }),
    })
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const addLink = () => {
    if (newLink.trim()) {
      setFormData((prev) => ({
        ...prev,
        related_links: [...prev.related_links, newLink.trim()],
      }))
      setNewLink("")
    }
  }

  const removeLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      related_links: prev.related_links.filter((_, i) => i !== index),
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-slate-800/50 rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title" className="text-white">
            Title
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            className="bg-slate-700 border-slate-600 text-white"
            required
          />
        </div>

        <div>
          <Label htmlFor="category" className="text-white">
            Category
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
          >
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="summary" className="text-white">
          Summary
        </Label>
        <Input
          id="summary"
          value={formData.summary}
          onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
          className="bg-slate-700 border-slate-600 text-white"
          placeholder="Brief description..."
        />
      </div>

      <div>
        <Label htmlFor="content" className="text-white">
          Content
        </Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
          className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
          placeholder="Detailed content..."
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="status" className="text-white">
            Status
          </Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
          >
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="priority" className="text-white">
            Priority
          </Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
          >
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((priority) => (
                <SelectItem key={priority.value} value={priority.value}>
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="rating" className="text-white">
            Rating
          </Label>
          <Select
            value={formData.rating?.toString() || ""}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                rating: value ? Number.parseInt(value) : null,
              }))
            }
          >
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Rate..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No rating</SelectItem>
              {[1, 2, 3, 4, 5].map((rating) => (
                <SelectItem key={rating} value={rating.toString()}>
                  {rating} Star{rating !== 1 ? "s" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="public"
          checked={formData.is_public}
          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_public: checked }))}
        />
        <Label htmlFor="public" className="text-white">
          Make public
        </Label>
      </div>

      {/* Tags */}
      <div>
        <Label className="text-white">Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-red-400 hover:text-red-300">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex space-x-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add tag..."
            className="bg-slate-700 border-slate-600 text-white"
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
          />
          <Button type="button" onClick={addTag} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Related Links */}
      <div>
        <Label className="text-white">Related Links</Label>
        <div className="space-y-2 mb-2">
          {formData.related_links.map((link, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input value={link} readOnly className="bg-slate-700 border-slate-600 text-white" />
              <Button
                type="button"
                onClick={() => removeLink(index)}
                size="sm"
                variant="ghost"
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex space-x-2">
          <Input
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="Add link..."
            className="bg-slate-700 border-slate-600 text-white"
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLink())}
          />
          <Button type="button" onClick={addLink} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>
      </div>
    </form>
  )
}
