import Link from 'next/link'

interface BreadcrumbsProps {
  category: string
  current: string
}

export default function Breadcrumbs({ category, current }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
      <Link href="/" className="hover:text-primary transition-colors">
        Home
      </Link>
      <span>/</span>
      <Link href="/products" className="hover:text-primary transition-colors">
        Products
      </Link>
      <span>/</span>
      <span className="hover:text-primary transition-colors">{category}</span>
      <span>/</span>
      <span className="text-gray-900 font-medium">{current}</span>
    </nav>
  )
}


