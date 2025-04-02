import { match } from '@lib/utils/match'
import { useEffect } from 'react'

type ScrollTarget = ScrollToOptions | string | HTMLElement | null

export const useScrollTo = (
  target: ScrollTarget = { top: 0, behavior: 'smooth' },
  behavior: ScrollBehavior = 'smooth'
) => {
  useEffect(() => {
    if (target === null) return

    const type =
      typeof target === 'string'
        ? 'string'
        : target instanceof HTMLElement
          ? 'element'
          : 'options'

    match(type, {
      string: () => {
        const el = document.querySelector(target as string)
        el?.scrollIntoView({ behavior })
      },
      element: () => {
        return (target as HTMLElement).scrollIntoView({ behavior })
      },
      options: () => {
        window.scrollTo(target as ScrollToOptions)
      },
    })
  }, [behavior, target])
}
