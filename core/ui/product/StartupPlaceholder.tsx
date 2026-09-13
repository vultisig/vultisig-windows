import { Center } from '@lib/ui/layout/Center'
import { Spinner } from '@lib/ui/loaders/Spinner'

import { ProductLogoBlock } from './ProductLogoBlock'
import { useStartupSplash } from './startupSplash'

/**
 * What the shell shows while startup work (WalletCore, storage, migrations,
 * key shares) is still pending: the brand splash when it is enabled, otherwise
 * a neutral spinner so the action popup never plays the logo animation.
 */
export const StartupPlaceholder = () => {
  const { isSplashEnabled } = useStartupSplash()

  if (isSplashEnabled) {
    return <ProductLogoBlock />
  }

  return (
    <Center>
      <Spinner />
    </Center>
  )
}
