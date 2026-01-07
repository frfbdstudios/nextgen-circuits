'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { popupBannerService, type PopupBanner } from '@/lib/supabase/popup-banners'
import Image from 'next/image'
import { Button } from './ui/button'

export function PopupBannerModal() {
    const [banners, setBanners] = useState<PopupBanner[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Check if user has already seen the popup in this session
        const hasSeenPopup = sessionStorage.getItem('hasSeenPopup')

        if (!hasSeenPopup) {
        loadBanners()
        }
    }, [])

    const loadBanners = async () => {
        const activeBanners = await popupBannerService.getActiveBanners()
        if (activeBanners.length > 0) {
            setBanners(activeBanners)
            setIsVisible(true)
        }
    }

    const handleClose = () => {
        setIsVisible(false)
        sessionStorage.setItem('hasSeenPopup', 'true')
    }

    const handleNext = () => {
        if (currentIndex < banners.length - 1) {
            setCurrentIndex(currentIndex + 1)
        } else {
            handleClose()
        }
    }

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
        }
    }

    if (!isVisible || banners.length === 0) return null

    const currentBanner = banners[currentIndex]

    return (
        <div className="fixed inset-0 bg-white/0 flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-300">
            <div className="relative bg-white/0 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden backdrop-blur-sm">
                {/* Close Button */}
                <Button
                    onClick={handleClose}
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white rounded-full shadow-lg"
                >
                    <X className="w-5 h-5" />
                </Button>

                <h2 className='text-3xl font-semibold text-background text-center my-3'>{currentBanner.title}</h2>

                {/* Banner Image */}
                <div className="relative w-full aspect-[10/10]">
                    <div className='flex items-center justify-center'>
                        <Image
                            src={currentBanner.image_url}
                            alt={currentBanner.title}
                            height={500}
                            width={500}
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* Navigation */}
                {banners.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
                        <Button
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                            variant="secondary"
                            size="sm"
                        >
                            Previous
                        </Button>
                        <div className="flex gap-2">
                            {banners.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                        ? 'bg-white w-8'
                                        : 'bg-white/50 hover:bg-white/75'
                                        }`}
                                />
                            ))}
                        </div>
                        <Button
                            onClick={handleNext}
                            variant="secondary"
                            size="sm"
                        >
                            {currentIndex === banners.length - 1 ? 'Close' : 'Next'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}