import {
  BannerId,
  useDismissBanner,
  useDismissedBanners,
} from '@core/ui/storage/dismissedBanners'
import { ReactNode, useEffect, useState } from 'react'

import {
  CarouselContainer,
  CarouselSlide,
  CarouselTrack,
  CarouselViewport,
  PaginationContainer,
  PaginationDot,
} from './BannerCarousel.styles'

type BannerConfig = {
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
  const [isHoverPaused, setIsHoverPaused] = useState(false)
  const [isFocusPaused, setIsFocusPaused] = useState(false)

  const activeBanners = banners.filter(banner => !isBannerDismissed(banner.id))
  const isPaused = isHoverPaused || isFocusPaused

  useEffect(() => {
    if (currentIndex >= activeBanners.length && activeBanners.length > 0) {
      setCurrentIndex(Math.max(0, activeBanners.length - 1))
    }
  }, [activeBanners.length, currentIndex])

  useEffect(() => {
    if (isPaused || activeBanners.length < 2) {
      return
    }

    const interval = window.setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeBanners.length)
    }, 5000)

    return () => window.clearInterval(interval)
  }, [activeBanners.length, isPaused])

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

  const safeIndex = Math.min(
    currentIndex,
    Math.max(0, activeBanners.length - 1)
  )
  const showPagination = activeBanners.length > 1

  return (
    <CarouselContainer
      onMouseEnter={() => setIsHoverPaused(true)}
      onMouseLeave={() => setIsHoverPaused(false)}
      onFocusCapture={() => setIsFocusPaused(true)}
      onBlurCapture={event => {
        const nextTarget = event.relatedTarget

        if (
          nextTarget instanceof Node &&
          event.currentTarget.contains(nextTarget)
        ) {
          return
        }

        setIsFocusPaused(false)
      }}
    >
      <CarouselViewport>
        <CarouselTrack
          animate={{ x: `${safeIndex * -100}%` }}
          transition={{ type: 'spring', stiffness: 260, damping: 32 }}
        >
          {activeBanners.map((banner, index) => (
            <CarouselSlide
              key={banner.id}
              aria-hidden={index !== safeIndex}
              inert={index === safeIndex ? undefined : true}
            >
              {typeof banner.component === 'function'
                ? banner.component({
                    onDismiss: () => handleDismiss(banner.id),
                  })
                : banner.component}
            </CarouselSlide>
          ))}
        </CarouselTrack>
      </CarouselViewport>

      {showPagination && (
        <PaginationContainer>
          {activeBanners.map((banner, index) => (
            <PaginationDot
              key={banner.id}
              $isActive={index === safeIndex}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to banner ${index + 1}`}
              aria-current={index === safeIndex ? 'true' : undefined}
            />
          ))}
        </PaginationContainer>
      )}
    </CarouselContainer>
  )
}
