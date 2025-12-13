"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { debounce } from "@/lib/utils"
import { getBrowserSupabaseClient } from "@/lib/supabase/browser"
import { Loader2 } from "lucide-react"

interface Category {
  id: string
  name: string
}

interface FilterState {
  min: string
  max: string
  categories: string[]
  stock: string
  rating: string
}

const STORAGE_KEY = "product_filters"

// Helper to get current filters from localStorage
const getStoredFilters = (): FilterState => {
  if (typeof window === 'undefined') return { min: "", max: "", categories: [], stock: "", rating: "" }
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : { min: "", max: "", categories: [], stock: "", rating: "" }
}

// Helper to update localStorage with partial state
const updateStoredFilters = (updates: Partial<FilterState>) => {
  const current = getStoredFilters()
  const updated = { ...current, ...updates }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  // Trigger a custom event to notify listeners
  window.dispatchEvent(new Event('filtersUpdated'))
}

export default function Filters() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const supabase = getBrowserSupabaseClient()

  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Local state for all filters
  const [minValue, setMinValue] = useState("")
  const [maxValue, setMaxValue] = useState("")
  
  const hasInitialized = useRef(false)
  const [filterTrigger, setFilterTrigger] = useState(0)

  // Initialize from localStorage or URL params on first mount
  useEffect(() => {
    if (!hasInitialized.current) {
      // Initialize localStorage with empty values
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
        min: "", 
        max: "", 
        categories: [], 
        stock: "", 
        rating: "" 
      }))
      
      // Load from URL params
      const urlMin = params.get("min") ?? ""
      const urlMax = params.get("max") ?? ""
      const urlCategories = params.getAll("category")
      const urlStock = params.get("stock") ?? ""
      const urlRating = params.get("rating") ?? ""
      
      // Set local state
      setMinValue(urlMin)
      setMaxValue(urlMax)
      
      // Save all to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
        min: urlMin, 
        max: urlMax, 
        categories: urlCategories, 
        stock: urlStock, 
        rating: urlRating 
      }))
      
      hasInitialized.current = true
    }
  }, [params])

  // Listen for localStorage changes and update URL
  useEffect(() => {
    const handleFiltersUpdate = () => {
      setFilterTrigger(prev => prev + 1)
    }

    window.addEventListener('filtersUpdated', handleFiltersUpdate)
    return () => window.removeEventListener('filtersUpdated', handleFiltersUpdate)
  }, [])

  // Sync localStorage to URL params
  useEffect(() => {
    if (!hasInitialized.current) return

    const filters = getStoredFilters()
    const newParams = new URLSearchParams(params?.toString())
    
    // Update min
    if (filters.min) {
      newParams.set("min", filters.min)
    } else {
      newParams.delete("min")
    }
    
    // Update max
    if (filters.max) {
      newParams.set("max", filters.max)
    } else {
      newParams.delete("max")
    }
    
    // Update categories
    newParams.delete("category")
    filters.categories.forEach((cat) => newParams.append("category", cat))
    
    // Update stock
    if (filters.stock) {
      newParams.set("stock", filters.stock)
    } else {
      newParams.delete("stock")
    }
    
    // Update rating
    if (filters.rating) {
      newParams.set("rating", filters.rating)
    } else {
      newParams.delete("rating")
    }
    
    router.replace(`${pathname}?${newParams.toString()}`)
  }, [filterTrigger, pathname, router, params])

  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name')
          .order('name')

        if (error) throw error
        setCategories(data || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [supabase])

  // Debounced functions for price filters
  const debouncedSetMin = useRef(
    debounce((value: string) => {
      updateStoredFilters({ min: value })
    }, 500)
  ).current

  const debouncedSetMax = useRef(
    debounce((value: string) => {
      updateStoredFilters({ max: value })
    }, 500)
  ).current

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value
    setMinValue(value)
    debouncedSetMin(value)
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value
    setMaxValue(value)
    debouncedSetMax(value)
  }

  const toggleCategory = (categoryId: string) => {
    const current = params.getAll("category")
    const exists = current.includes(categoryId)
    const next = exists ? current.filter((v) => v !== categoryId) : [...current, categoryId]
    
    // Update localStorage
    updateStoredFilters({ categories: next })
  }

  const handleStockChange = (value: string) => {
    const stockValue = value === "clear" ? "" : value
    
    // Update localStorage
    updateStoredFilters({ stock: stockValue })
  }

  const handleRatingChange = (value: string) => {
    const ratingValue = value === "clear" ? "" : value
    
    // Update localStorage
    updateStoredFilters({ rating: ratingValue })
  }

  const handleReset = () => {
    // Clear localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
      min: "", 
      max: "", 
      categories: [], 
      stock: "", 
      rating: "" 
    }))
    
    // Clear local state
    setMinValue("")
    setMaxValue("")
    
    // Trigger update
    window.dispatchEvent(new Event('filtersUpdated'))
  }

  const activeCategories = useMemo(() => params.getAll("category"), [params])

  return (
    <div className="space-y-2">
      {/* Categories */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Category</p>
        {loadingCategories ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-gray-500">No categories available</p>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => {
              const checked = activeCategories.includes(cat.id)
              return (
                <div key={cat.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${cat.id}`}
                    checked={checked}
                    onCheckedChange={() => toggleCategory(cat.id)}
                  />
                  <label
                    htmlFor={`category-${cat.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {cat.name}
                  </label>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Price Range */}
      {/* <div className="space-y-2">
        <p className="text-sm font-medium">Price Range (৳ BDT)</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="min" className="text-xs">Min</Label>
            <Input
              id="min"
              type="text"
              inputMode="numeric"
              placeholder="Min price"
              value={minValue}
              onChange={handleMinChange}
              onKeyDown={(e) => {
                // Allow: backspace, delete, tab, escape, enter, decimal point
                if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
                  // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                  (e.keyCode === 65 && e.ctrlKey === true) ||
                  (e.keyCode === 67 && e.ctrlKey === true) ||
                  (e.keyCode === 86 && e.ctrlKey === true) ||
                  (e.keyCode === 88 && e.ctrlKey === true) ||
                  // Allow: home, end, left, right
                  (e.keyCode >= 35 && e.keyCode <= 39)) {
                  return
                }
                // Ensure that it is a number and stop the keypress
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                  e.preventDefault()
                }
              }}
            />
          </div>
          <div>
            <Label htmlFor="max" className="text-xs">Max</Label>
            <Input
              id="max"
              type="text"
              inputMode="numeric"
              placeholder="Max price"
              value={maxValue}
              onChange={handleMaxChange}
              onKeyDown={(e) => {
                // Allow: backspace, delete, tab, escape, enter, decimal point
                if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
                  // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                  (e.keyCode === 65 && e.ctrlKey === true) ||
                  (e.keyCode === 67 && e.ctrlKey === true) ||
                  (e.keyCode === 86 && e.ctrlKey === true) ||
                  (e.keyCode === 88 && e.ctrlKey === true) ||
                  // Allow: home, end, left, right
                  (e.keyCode >= 35 && e.keyCode <= 39)) {
                  return
                }
                // Ensure that it is a number and stop the keypress
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                  e.preventDefault()
                }
              }}
            />
          </div>
        </div>
      </div> */}

      {/* Stock Status */}
      <div className="space-y-2">
        <Label>Stock Status</Label>
        <Select
          value={params.get("stock") ?? undefined}
          onValueChange={handleStockChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clear">Any</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="low_stock">Low Stock (&lt;= 10)</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Minimum Rating */}
      <div className="space-y-2">
        <Label>Minimum Rating</Label>
        <Select
          value={params.get("rating") ?? undefined}
          onValueChange={handleRatingChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clear">Any</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="3">3+ Stars</SelectItem>
            <SelectItem value="2">2+ Stars</SelectItem>
            <SelectItem value="1">1+ Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      <Button
        variant="secondary"
        className="w-full"
        onClick={handleReset}
      >
        Reset Filters
      </Button>
    </div>
  )
}


