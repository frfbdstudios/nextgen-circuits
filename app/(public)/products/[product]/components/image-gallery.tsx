'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImageGalleryProps {
  images: string[]
  name: string
}

export default function ImageGallery({ images, name }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  // Default placeholder if no images
  const displayImages = images.length > 0 ? images : ['/placeholder-product.jpg']

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square w-11/12 lg:w-5/6 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
        <Image
          src={displayImages[selectedImage]}
          alt={`${name} - Image ${selectedImage + 1}`}
          fill
          className="object-contain"
          priority
          sizes="(max-width: 768px) 20vw, 20vw"
        />
      </div>

      {/* Thumbnail Images */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                selectedImage === index
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image
                src={image}
                alt={`${name} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 12.5vw"
              />
            </button>
          ))}
        </div>
      )}

      {/* Image Counter */}
      <p className="text-center text-sm text-gray-500">
        {selectedImage + 1} / {displayImages.length}
      </p>
    </div>
  )
}


