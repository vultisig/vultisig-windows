import { useHomeMotion } from './homeMotion'
import { HomeTab } from './homeTab'

export const useHomePageScrollRef = (tab: HomeTab) => {
  const { scrollY, scrollContainers } = useHomeMotion()

  return (element: HTMLElement | null) => {
    if (!element) return

    scrollContainers.set(tab, element)
    const handleScroll = () => scrollY[tab].set(element.scrollTop)
    handleScroll()
    element.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      element.removeEventListener('scroll', handleScroll)
      scrollContainers.delete(tab)
      scrollY[tab].set(0)
    }
  }
}
