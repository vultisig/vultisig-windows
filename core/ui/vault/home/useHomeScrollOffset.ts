import { enforceRange } from '@vultisig/lib-utils/enforceRange'
import { useTransform } from 'framer-motion'

import { useHomeMotion } from './homeMotion'

/** Blended between the two pages' offsets mid-swipe so the header never jumps. */
export const useHomeScrollOffset = () => {
  const { position, scrollY } = useHomeMotion()

  return useTransform(() => {
    const progress = enforceRange(position.get(), 0, 1)
    const wallet = scrollY.wallet.get()

    return wallet + (scrollY.defi.get() - wallet) * progress
  })
}
