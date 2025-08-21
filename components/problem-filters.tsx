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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dim-gray" />
          <Input
            placeholder="Search problems..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10 bg-white border-slate-gray/20 focus:border-ut-orange"
          />
        </div>

        {/* Category Filter */}
        <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
          <SelectTrigger className="w-full sm:w-48 bg-white border-slate-gray/20 focus:border-ut-orange">
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
          <SelectTrigger className="w-full sm:w-48 bg-white border-slate-gray/20 focus:border-ut-orange">
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
          <SelectTrigger className="w-full sm:w-48 bg-white border-slate-gray/20 focus:border-ut-orange">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="not_attempted">Not Attempted</SelectItem>
            <SelectItem value="attempted">Attempted</SelectItem>
            <SelectItem value="solved">Solved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-dim-gray">Active filters:</span>
          {filters.search && (
            <Badge variant="outline" className="border-ut-orange/30 text-ut-orange">
              Search: "{filters.search}"
              <button
                onClick={() => updateFilter("search", "")}
                className="ml-2 hover:bg-ut-orange/10 rounded-full p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.category !== "all" && (
            <Badge variant="outline" className="border-slate-gray/30 text-slate-gray">
              Category: {categories.find(c => c.id === filters.category)?.name}
              <button
                onClick={() => updateFilter("category", "all")}
                className="ml-2 hover:bg-slate-gray/10 rounded-full p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.difficulty !== "all" && (
            <Badge variant="outline" className="border-slate-gray/30 text-slate-gray">
              Difficulty: {difficulties.find(d => d.id === filters.difficulty)?.name}
              <button
                onClick={() => updateFilter("difficulty", "all")}
                className="ml-2 hover:bg-slate-gray/10 rounded-full p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.status !== "all" && (
            <Badge variant="outline" className="border-slate-gray/30 text-slate-gray">
              Status: {filters.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
              <button
                onClick={() => updateFilter("status", "all")}
                className="ml-2 hover:bg-slate-gray/10 rounded-full p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button
            onClick={clearFilters}
            variant="outline"
            size="sm"
            className="border-slate-gray text-slate-gray hover:bg-slate-gray hover:text-white"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  )
}
