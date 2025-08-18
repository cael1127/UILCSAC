"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface Category {
  id: string
  name: string
  color: string
}

interface DifficultyLevel {
  id: string
  name: string
  level: number
  color: string
}

interface ProblemFiltersProps {
  onFiltersChange?: (filters: {
    search: string
    category: string
    difficulty: string
    status: string
  }) => void
}

export default function ProblemFilters({ onFiltersChange }: ProblemFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [difficulties, setDifficulties] = useState<DifficultyLevel[]>([])
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    difficulty: "all",
    status: "all",
  })

  useEffect(() => {
    // Fetch categories and difficulties
    const fetchFilters = async () => {
      const [categoriesResult, difficultiesResult] = await Promise.all([
        supabase.from("categories").select("*").order("name"),
        supabase.from("difficulty_levels").select("*").order("level"),
      ])

      if (categoriesResult.data) setCategories(categoriesResult.data)
      if (difficultiesResult.data) setDifficulties(difficultiesResult.data)
    }

    fetchFilters()
  }, [])

  useEffect(() => {
    onFiltersChange?.(filters)
  }, [filters, onFiltersChange])

  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "all",
      difficulty: "all",
      status: "all",
    })
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== "all")

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search problems..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>

        {/* Category Filter */}
        <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
          <SelectTrigger className="w-full sm:w-48 bg-input border-border">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Difficulty Filter */}
        <Select value={filters.difficulty} onValueChange={(value) => updateFilter("difficulty", value)}>
          <SelectTrigger className="w-full sm:w-48 bg-input border-border">
            <SelectValue placeholder="All Difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            {difficulties.map((difficulty) => (
              <SelectItem key={difficulty.id} value={difficulty.id}>
                {difficulty.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
          <SelectTrigger className="w-full sm:w-48 bg-input border-border">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="not_attempted">Not Attempted</SelectItem>
            <SelectItem value="attempted">Attempted</SelectItem>
            <SelectItem value="solved">Solved</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2 bg-transparent">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {filters.search}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("search", "")} />
            </Badge>
          )}
          {filters.category !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {categories.find((c) => c.id === filters.category)?.name}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("category", "all")} />
            </Badge>
          )}
          {filters.difficulty !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {difficulties.find((d) => d.id === filters.difficulty)?.name}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("difficulty", "all")} />
            </Badge>
          )}
          {filters.status !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("status", "all")} />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
