"use client"

import { cn } from "@/lib/utils"

// Theme-aware color utility functions
export const themeColors = {
  // Background colors
  bg: {
    card: "bg-[var(--card)]",
    popover: "bg-[var(--popover)]",
    muted: "bg-[var(--muted)]",
    input: "bg-[var(--input)]",
    sidebar: "bg-[var(--sidebar)]",
    destructive: "bg-[var(--destructive)]",
    success: "bg-[var(--success)]",
    info: "bg-[var(--info)]",
    warning: "bg-[var(--warning)]",
  },
  
  // Text colors
  text: {
    card: "text-[var(--card-foreground)]",
    popover: "text-[var(--popover-foreground)]",
    muted: "text-[var(--muted-foreground)]",
    destructive: "text-[var(--destructive-foreground)]",
    success: "text-[var(--success-foreground)]",
    info: "text-[var(--info-foreground)]",
    warning: "text-[var(--warning-foreground)]",
    sidebar: "text-[var(--sidebar-foreground)]",
    sidebarPrimary: "text-[var(--sidebar-primary-foreground)]",
    sidebarAccent: "text-[var(--sidebar-accent-foreground)]",
  },
  
  // Border colors
  border: {
    default: "border-[var(--border)]",
    muted: "border-[var(--muted)]",
    destructive: "border-[var(--destructive)]",
    sidebar: "border-[var(--sidebar-border)]",
  },
  
  // Ring colors
  ring: {
    default: "ring-[var(--ring)]",
    destructive: "ring-[var(--destructive)]",
    sidebar: "ring-[var(--sidebar-ring)]",
  }
}

// Helper function to combine theme colors with other classes
export const themeClass = (baseClasses: string, themeClasses: string) => {
  return cn(baseClasses, themeClasses)
}

// Common theme-aware component classes
export const themeComponents = {
  card: cn(
    "bg-[var(--card)]",
    "text-[var(--card-foreground)]",
    "border-[var(--border)]"
  ),
  
  button: {
    primary: cn(
      "bg-[var(--primary)]",
      "text-[var(--primary-foreground)]",
      "hover:bg-[var(--primary)]/90"
    ),
    secondary: cn(
      "bg-[var(--secondary)]",
      "text-[var(--secondary-foreground)]",
      "hover:bg-[var(--secondary)]/90"
    ),
    outline: cn(
      "border-[var(--border)]",
      "text-[var(--foreground)]",
      "hover:bg-[var(--muted)]",
      "hover:text-[var(--muted-foreground)]"
    ),
    destructive: cn(
      "bg-[var(--destructive)]",
      "text-[var(--destructive-foreground)]",
      "hover:bg-[var(--destructive)]/90"
    ),
  },
  
  input: cn(
    "bg-[var(--input)]",
    "text-[var(--foreground)]",
    "border-[var(--border)]",
    "focus:ring-[var(--ring)]"
  ),
  
  sidebar: cn(
    "bg-[var(--sidebar)]",
    "text-[var(--sidebar-foreground)]",
    "border-[var(--sidebar-border)]"
  )
}
