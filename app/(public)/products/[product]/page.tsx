import { notFound } from 'next/navigation'
import Breadcrumbs from "./components/breadcrumbs"
import ImageGallery from "./components/image-gallery"
import ProductActions from "./components/product-actions"
import ProductTabs from "./components/product-tabs"
import AddToWishlistButton from "./components/add-to-wishlist-button"
import { getServerSupabaseClient } from '@/lib/supabase/server'
import { checkWishlistStatus } from '@/lib/actions/wishlist'

interface ProductPageProps {
  params: Promise<{
    product: string
  }>
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
  created_at: string
}

async function getProduct(sku: string): Promise<Product | null> {
  const supabase = await getServerSupabaseClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('sku', sku)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data
}

async function getCategoryName(categoryId: string): Promise<string> {
  const supabase = await getServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('name')
    .eq('id', categoryId)
    .single()

  if (error || !data) {
    return 'Unknown Category'
  }

  return data.name
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { product: productSku } = await params
  const product = await getProduct(productSku)

  if (!product) {
    notFound()
  }

  const categoryName = await getCategoryName(product.category)
  const { inWishlist } = await checkWishlistStatus(product.id)

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs 
          category={categoryName}
          current={product.name} 
        />

        {/* Product header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Image gallery */}
          <div className="lg:col-span-6">
            <ImageGallery images={product.images} name={product.name} />
          </div>

          {/* Details */}
          <div className="lg:col-span-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                {product.name}
              </h1>
              <AddToWishlistButton 
                productId={product.id} 
                initialInWishlist={inWishlist}
              />
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Product ID: <span className="font-medium">{product.sku}</span>
            </p>

            <p className="text-primary font-medium mb-2">
              Category: <span className="text-gray-800">{categoryName}</span>
            </p>
            
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl sm:text-3xl font-bold">
                ৳{product.price.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">BDT</span>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Availability:</p>
              <div className="flex items-center gap-2">
                {product.stock > 0 ? (
                  <>
                    <span className="inline-flex items-center justify-center w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-green-600 font-medium">
                      In Stock ({product.stock} available)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center justify-center w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="text-red-600 font-medium">Out of Stock</span>
                  </>
                )}
              </div>
            </div>

            <ProductActions 
              stock={product.stock}
              productId={product.id}
              sku={product.sku}
            />
          </div>
        </div>

        <ProductTabs product={product} />
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { product: productSku } = await params
  const product = await getProduct(productSku)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: `${product.name} | NextGen Circuits`,
    description: product.description,
  }
}