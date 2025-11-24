import { RefObject, useEffect, useState } from 'react'

type ScrollState = {
  x: number
  y: number
}

export const useScroll = (elementRef: RefObject<HTMLElement>) => {
  const [scroll, setScroll] = useState<ScrollState>({ x: 0, y: 0 })

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleScroll = () => {
      setScroll({
        x: element.scrollLeft,
        y: element.scrollTop,
      })
    }

    element.addEventListener('scroll', handleScroll, { passive: true })

    handleScroll()

    return () => {
      element.removeEventListener('scroll', handleScroll)
    }
  }, [elementRef])

  return scroll
}
