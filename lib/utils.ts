import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function formatTime(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date))
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
}

export function truncate(text: string, length: number) {
  if (text.length <= length) return text
  return text.slice(0, length) + "..."
}

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function getPriorityColor(priority: string) {
  switch (priority.toLowerCase()) {
    case "high":
      return "text-red-500"
    case "medium":
      return "text-yellow-500"
    case "low":
      return "text-green-500"
    default:
      return "text-gray-500"
  }
}

export function getPriorityBadgeVariant(priority: string) {
  switch (priority.toLowerCase()) {
    case "high":
      return "destructive"
    case "medium":
      return "default"
    case "low":
      return "secondary"
    default:
      return "outline"
  }
}
