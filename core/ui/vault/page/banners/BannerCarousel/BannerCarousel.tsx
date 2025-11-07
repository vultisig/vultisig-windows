import {
  BannerId,
  useDismissBanner,
  useDismissedBanners,
} from '@core/ui/storage/dismissedBanners'
import { AnimatePresence, motion } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'

import {
  CarouselContainer,
  CarouselTrack,
  NavigationButton,
  PaginationContainer,
  PaginationDot,
} from './BannerCarousel.styles'

export type BannerConfig = {
  id: BannerId
  component: ReactNode | ((props: { onDismiss: () => void }) => ReactNode)
}

type BannerCarouselProps = {
  banners: BannerConfig[]
}

export const BannerCarousel = ({ banners }: BannerCarouselProps) => {
  const { isBannerDismissed } = useDismissedBanners()
  const dismissBanner = useDismissBanner()
  const [currentIndex, setCurrentIndex] = useState(0)

  // Filter out dismissed banners
  const activeBanners = banners.filter(banner => !isBannerDismissed(banner.id))

  // Adjust current index if it's out of bounds
  useEffect(() => {
    if (currentIndex >= activeBanners.length && activeBanners.length > 0) {
      setCurrentIndex(Math.max(0, activeBanners.length - 1))
    }
  }, [activeBanners.length, currentIndex])

  // If all banners are dismissed, return null
  if (activeBanners.length === 0) {
    return null
  }

  const handleDismiss = (bannerId: BannerId) => {
    dismissBanner(bannerId)

    // If we're dismissing the current banner and it's not the last one,
    // stay at the same index (which will show the next banner)
    // If it's the last banner, go to the previous one
    if (currentIndex >= activeBanners.length - 1 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % activeBanners.length)
  }

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? activeBanners.length - 1 : prev - 1))
  }

  const currentBanner = activeBanners[currentIndex]
  const showNavigation = activeBanners.length > 1

  return (
    <CarouselContainer>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          style={{ width: '100%' }}
        >
          <CarouselTrack>
            {typeof currentBanner.component === 'function'
              ? currentBanner.component({
                  onDismiss: () => handleDismiss(currentBanner.id),
                })
              : currentBanner.component}
          </CarouselTrack>
        </motion.div>
      </AnimatePresence>

      {showNavigation && (
        <>
          <NavigationButton
            onClick={goToPrevious}
            $position="left"
            aria-label="Previous banner"
          >
            ‹
          </NavigationButton>
          <NavigationButton
            onClick={goToNext}
            $position="right"
            aria-label="Next banner"
          >
            ›
          </NavigationButton>

          <PaginationContainer>
            {activeBanners.map((banner, index) => (
              <PaginationDot
                key={banner.id}
                $isActive={index === currentIndex}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </PaginationContainer>
        </>
      )}
    </CarouselContainer>
  )
}
