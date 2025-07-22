"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  BookOpen,
  Plus,
  ChevronDown,
  ChevronRight,
  Edit3,
  Save,
  X,
  Trash2,
  Star,
  Eye,
  EyeOff,
  Filter,
  Link,
  Tag,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { WikiEntry } from "@/lib/supabase/types"
import { formatDateTime } from "@/lib/utils"

interface WikiWidgetProps {
  userId: string
}

const categories = ["general", "work", "personal", "learning", "projects", "ideas", "reference", "notes"]

const statusOptions = [
  { value: "draft", label: "Draft", color: "bg-gray-500" },
  { value: "published", label: "Published", color: "bg-green-500" },
  { value: "archived", label: "Archived", color: "bg-yellow-500" },
]

const priorityOptions = [
  { value: "low", label: "Low", color: "bg-green-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "high", label: "High", color: "bg-red-500" },
]

export default function WikiWidget({ userId }: WikiWidgetProps) {
  const [entries, setEntries] = useState<WikiEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<WikiEntry[]>([])
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)

  // Filters
  const [filterTag, setFilterTag] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterVisibility, setFilterVisibility] = useState("")

  // Form state for new/editing entry
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    tags: [] as string[],
    category: "general",
    status: "draft",
    priority: "medium",
    is_public: false,
    rating: null as number | null,
    file_urls: [] as string[],
    related_links: [] as string[],
  })

  const [newTag, setNewTag] = useState("")
  const [newLink, setNewLink] = useState("")

  const supabase = createClient()

  useEffect(() => {
    fetchEntries()
  }, [userId])

  useEffect(() => {
    applyFilters()
  }, [entries, filterTag, filterCategory, filterStatus, filterVisibility])

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("wiki_entries")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error("Error fetching wiki entries:", error)
      // Fallback mock data for preview
      setEntries([
        {
          id: "wiki-1",
          user_id: userId,
          title: "Productivity System",
          summary: "My personal productivity methodology and tools",
          content: "# Productivity System\n\nThis is my comprehensive approach to staying productive...",
          tags: ["productivity", "system", "gtd"],
          category: "work",
          status: "published",
          priority: "high",
          is_public: false,
          rating: 5,
          file_urls: [],
          related_links: ["https://gettingthingsdone.com"],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "wiki-2",
          user_id: userId,
          title: "Learning Resources",
          summary: "Curated list of learning materials and courses",
          content: "Collection of valuable learning resources across different topics...",
          tags: ["learning", "resources", "education"],
          category: "learning",
          status: "draft",
          priority: "medium",
          is_public: true,
          rating: 4,
          file_urls: [],
          related_links: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = entries

    if (filterTag) {
      filtered = filtered.filter((entry) =>
        entry.tags.some((tag) => tag.toLowerCase().includes(filterTag.toLowerCase())),
      )
    }

    if (filterCategory) {
      filtered = filtered.filter((entry) => entry.category === filterCategory)
    }

    if (filterStatus) {
      filtered = filtered.filter((entry) => entry.status === filterStatus)
    }

    if (filterVisibility) {
      const isPublic = filterVisibility === "public"
      filtered = filtered.filter((entry) => entry.is_public === isPublic)
    }

    setFilteredEntries(filtered)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      summary: "",
      content: "",
      tags: [],
      category: "general",
      status: "draft",
      priority: "medium",
      is_public: false,
      rating: null,
      file_urls: [],
      related_links: [],
    })
    setNewTag("")
    setNewLink("")
  }

  const handleCreate = () => {
    setIsCreating(true)
    resetForm()
  }

  const handleEdit = (entry: WikiEntry) => {
    setEditingEntry(entry.id)
    setFormData({
      title: entry.title,
      summary: entry.summary || "",
      content: entry.content || "",
      tags: entry.tags,
      category: entry.category,
      status: entry.status,
      priority: entry.priority,
      is_public: entry.is_public,
      rating: entry.rating,
      file_urls: entry.file_urls,
      related_links: entry.related_links,
    })
  }

  const handleSave = async () => {
    try {
      if (isCreating) {
        const { data, error } = await supabase
          .from("wiki_entries")
          .insert([{ ...formData, user_id: userId }])
          .select()
          .single()

        if (error) throw error
        setEntries((prev) => [data, ...prev])
        setIsCreating(false)
      } else if (editingEntry) {
        const { data, error } = await supabase
          .from("wiki_entries")
          .update(formData)
          .eq("id", editingEntry)
          .select()
          .single()

        if (error) throw error
        setEntries((prev) => prev.map((entry) => (entry.id === editingEntry ? data : entry)))
        setEditingEntry(null)
      }
      resetForm()
    } catch (error) {
      console.error("Error saving entry:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("wiki_entries").delete().eq("id", id)

      if (error) throw error
      setEntries((prev) => prev.filter((entry) => entry.id !== id))
      if (expandedEntry === id) setExpandedEntry(null)
      if (editingEntry === id) setEditingEntry(null)
    } catch (error) {
      console.error("Error deleting entry:", error)
    }
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingEntry(null)
    resetForm()
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
    if (newLink.trim() && !formData.related_links.includes(newLink.trim())) {
      setFormData((prev) => ({
        ...prev,
        related_links: [...prev.related_links, newLink.trim()],
      }))
      setNewLink("")
    }
  }

  const removeLink = (linkToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      related_links: prev.related_links.filter((link) => link !== linkToRemove),
    }))
  }

  const renderStars = (rating: number | null, editable = false) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={editable ? () => setFormData((prev) => ({ ...prev, rating: i })) : undefined}
          className={`${editable ? "cursor-pointer hover:text-yellow-400" : "cursor-default"} ${
            rating && i <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          <Star className="h-4 w-4 fill-current" />
        </button>,
      )
    }
    return <div className="flex space-x-1">{stars}</div>
  }

  const getStatusColor = (status: string) => {
    return statusOptions.find((s) => s.value === status)?.color || "bg-gray-500"
  }

  const getPriorityColor = (priority: string) => {
    return priorityOptions.find((p) => p.value === priority)?.color || "bg-gray-500"
  }

  const allTags = Array.from(new Set(entries.flatMap((entry) => entry.tags)))

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-space-black-lighter">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-space-purple" />
            <span className="text-space-purple">Personal Wiki</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-space-black-lighter">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-space-purple" />
            <CardTitle className="text-space-purple">Personal Wiki</CardTitle>
            <Badge variant="secondary">{filteredEntries.length}</Badge>
          </div>
          <Button size="sm" onClick={handleCreate} className="bg-gradient-to-r from-space-purple to-space-blue">
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 pt-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="allTags">All Tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="allCategories">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="allStatus">All Status</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterVisibility} onValueChange={setFilterVisibility}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="public">Public</SelectItem>
            </SelectContent>
          </Select>

          {(filterTag !== "allTags" ||
            filterCategory !== "allCategories" ||
            filterStatus !== "allStatus" ||
            filterVisibility !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterTag("")
                setFilterCategory("")
                setFilterStatus("")
                setFilterVisibility("")
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Create New Entry Form */}
        {isCreating && (
          <Card className="border-space-purple/50">
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Entry title..."
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="summary">Summary</Label>
                <Input
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                  placeholder="Brief summary..."
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Entry content (supports Markdown)..."
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Rating</Label>
                  {renderStars(formData.rating, true)}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_public: checked }))}
                />
                <Label htmlFor="public">Make Public</Label>
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag..."
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                  />
                  <Button type="button" size="sm" onClick={addTag}>
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Related Links */}
              <div>
                <Label>Related Links</Label>
                <div className="space-y-2 mb-2">
                  {formData.related_links.map((link) => (
                    <div key={link} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Link className="h-4 w-4" />
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline flex-1 truncate"
                      >
                        {link}
                      </a>
                      <X className="h-4 w-4 cursor-pointer" onClick={() => removeLink(link)} />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    placeholder="Add URL..."
                    onKeyPress={(e) => e.key === "Enter" && addLink()}
                  />
                  <Button type="button" size="sm" onClick={addLink}>
                    <Link className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!formData.title.trim()}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Entries List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {entries.length === 0 ? "No wiki entries yet" : "No entries match your filters"}
              </p>
              {entries.length === 0 && (
                <Button onClick={handleCreate} className="bg-gradient-to-r from-space-purple to-space-blue">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Entry
                </Button>
              )}
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <Card key={entry.id} className="border-muted">
                <CardContent className="pt-4">
                  {/* Entry Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                        className="p-0 h-auto"
                      >
                        {expandedEntry === entry.id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{entry.title}</h4>
                        {entry.summary && <p className="text-xs text-muted-foreground mt-1">{entry.summary}</p>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(entry.status)}`} />
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(entry.priority)}`} />
                      {entry.is_public ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(entry)} className="p-1 h-auto">
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                        className="p-1 h-auto text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Tags and Metadata */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {entry.category}
                    </Badge>
                    {entry.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {entry.rating && renderStars(entry.rating)}
                    <span className="text-xs text-muted-foreground ml-auto">{formatDateTime(entry.updated_at)}</span>
                  </div>

                  {/* Expanded Content */}
                  {expandedEntry === entry.id && (
                    <div className="mt-4 space-y-4">
                      <Separator />

                      {editingEntry === entry.id ? (
                        /* Edit Form - Similar to create form but with existing data */
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="edit-title">Title *</Label>
                              <Input
                                id="edit-title"
                                value={formData.title}
                                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-category">Category</Label>
                              <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="edit-summary">Summary</Label>
                            <Input
                              id="edit-summary"
                              value={formData.summary}
                              onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-content">Content</Label>
                            <Textarea
                              id="edit-content"
                              value={formData.content}
                              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                              rows={6}
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label>Status</Label>
                              <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusOptions.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                      {status.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Priority</Label>
                              <Select
                                value={formData.priority}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {priorityOptions.map((priority) => (
                                    <SelectItem key={priority.value} value={priority.value}>
                                      {priority.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Rating</Label>
                              {renderStars(formData.rating, true)}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id="edit-public"
                              checked={formData.is_public}
                              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_public: checked }))}
                            />
                            <Label htmlFor="edit-public">Make Public</Label>
                          </div>

                          {/* Tags */}
                          <div>
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {formData.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                  {tag}
                                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                                </Badge>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Input
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder="Add tag..."
                                onKeyPress={(e) => e.key === "Enter" && addTag()}
                              />
                              <Button type="button" size="sm" onClick={addTag}>
                                <Tag className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Related Links */}
                          <div>
                            <Label>Related Links</Label>
                            <div className="space-y-2 mb-2">
                              {formData.related_links.map((link) => (
                                <div key={link} className="flex items-center gap-2 p-2 bg-muted rounded">
                                  <Link className="h-4 w-4" />
                                  <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-500 hover:underline flex-1 truncate"
                                  >
                                    {link}
                                  </a>
                                  <X className="h-4 w-4 cursor-pointer" onClick={() => removeLink(link)} />
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Input
                                value={newLink}
                                onChange={(e) => setNewLink(e.target.value)}
                                placeholder="Add URL..."
                                onKeyPress={(e) => e.key === "Enter" && addLink()}
                              />
                              <Button type="button" size="sm" onClick={addLink}>
                                <Link className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={handleCancel}>
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                            <Button onClick={handleSave}>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <div className="space-y-4">
                          {entry.content && (
                            <div className="prose prose-sm max-w-none">
                              <pre className="whitespace-pre-wrap text-sm">{entry.content}</pre>
                            </div>
                          )}

                          {entry.related_links.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium">Related Links</Label>
                              <div className="space-y-1 mt-2">
                                {entry.related_links.map((link) => (
                                  <div key={link} className="flex items-center gap-2">
                                    <Link className="h-4 w-4" />
                                    <a
                                      href={link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-500 hover:underline truncate"
                                    >
                                      {link}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
