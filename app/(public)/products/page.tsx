import { getServerSupabaseClient } from '@/lib/supabase/server'
import ProductCard from './components/product-card'
import Filters from './components/filters'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import SortSelect from './components/sort-select'

interface SearchParams {
  q?: string
  category?: string | string[]
  min?: string
  max?: string
  rating?: string
  stock?: string
  sort?: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  sku: string
  images: string[]
  is_active: boolean
}

function applyFilters(
  query: any,
  searchParams: SearchParams
) {
  // Category filter
  if (searchParams.category) {
    const categories = Array.isArray(searchParams.category)
      ? searchParams.category
      : [searchParams.category]
    query = query.in('category', categories)
  }

  // Price range filter
  if (searchParams.min) {
    query = query.gte('price', parseFloat(searchParams.min))
  }
  if (searchParams.max) {
    query = query.lte('price', parseFloat(searchParams.max))
  }

  // Stock filter
  if (searchParams.stock) {
    switch (searchParams.stock) {
      case 'in_stock':
        query = query.gt('stock', 0)
        break
      case 'low_stock':
        query = query.gt('stock', 0).lte('stock', 10)
        break
      case 'out_of_stock':
        query = query.eq('stock', 0)
        break
    }
  }

  return query
}

function applySorting(query: any, searchParams: SearchParams) {
  const sortBy = searchParams.sort || 'newest'
  switch (sortBy) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'name_asc':
      query = query.order('name', { ascending: true })
      break
    case 'name_desc':
      query = query.order('name', { ascending: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }
  return query
}

async function getProducts(searchParams: SearchParams) {
  const supabase = await getServerSupabaseClient()

  // When there's a search query, split into two ranked groups:
  // 1. Primary matches: name or SKU contains the query (most relevant)
  // 2. Secondary matches: only the description contains the query
  // Sorting is applied within each group so primary results always come first.
  if (searchParams.q) {
    const q = searchParams.q

    // Group 1: name/SKU matches
    let primaryQuery = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${q}%,sku.ilike.%${q}%`)
    primaryQuery = applyFilters(primaryQuery, searchParams)
    primaryQuery = applySorting(primaryQuery, searchParams)

    // Group 2: description-only matches (exclude name/SKU matches to avoid duplicates)
    let secondaryQuery = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .ilike('description', `%${q}%`)
      .not('name', 'ilike', `%${q}%`)
      .not('sku', 'ilike', `%${q}%`)
    secondaryQuery = applyFilters(secondaryQuery, searchParams)
    secondaryQuery = applySorting(secondaryQuery, searchParams)

    const [primaryResult, secondaryResult] = await Promise.all([
      primaryQuery,
      secondaryQuery,
    ])

    if (primaryResult.error) {
      console.error('Error fetching primary products:', primaryResult.error)
      return []
    }
    if (secondaryResult.error) {
      console.error('Error fetching secondary products:', secondaryResult.error)
      return primaryResult.data as Product[]
    }

    return [
      ...(primaryResult.data as Product[]),
      ...(secondaryResult.data as Product[]),
    ]
  }

  // No search query — single query with filters + sorting
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)

  query = applyFilters(query, searchParams)
  query = applySorting(query, searchParams)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data as Product[]
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const products = await getProducts(params)

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4">
        {/* Search Bar - Top */}
        <div className="mb-4 px-0 sticky top-16 bg-background z-30 py-4">
          <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-4'>
            <div className='flex-1'>
              <form className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  name="q"
                  type="search"
                  placeholder="Search products by name or SKU..."
                  defaultValue={params.q}
                  className="pl-10 h-12 text-base bg-card w-full"
                />
              </form>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 hidden sm:inline">Sort:</span>
                <SortSelect defaultValue={params.sort || 'newest'} />
                {/* Mobile: Filter button (rendered by Filters component as a Sheet trigger) */}
                <div className="lg:hidden">
                  <Filters />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">

          {/* Desktop: Filters Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-36 bg-card rounded-lg shadow-sm p-4">
              <Filters />
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {products.length === 0 ? (
              <div className="bg-card rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}