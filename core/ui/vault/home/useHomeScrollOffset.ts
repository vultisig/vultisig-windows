import { useTransform } from 'framer-motion'

import { useHomeMotion } from './homeMotion'

const clampUnit = (value: number) => Math.min(Math.max(value, 0), 1)

/**
 * The shared header's scroll offset: the visible page's, blended between the
 * two pages' offsets mid-swipe so the header never jumps.
 */
export const useHomeScrollOffset = () => {
  const { position, scrollY } = useHomeMotion()

  return useTransform(() => {
    const progress = clampUnit(position.get())
    const wallet = scrollY.wallet.get()

    return wallet + (scrollY.defi.get() - wallet) * progress
  })
}
