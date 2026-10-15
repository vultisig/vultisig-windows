import { useHomeMotion } from './homeMotion'
import { HomeTab } from './homeTab'

/**
 * Callback ref for a home page's scroll container: registers it with the
 * pager and mirrors its scroll offset into the page's motion value.
 */
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
