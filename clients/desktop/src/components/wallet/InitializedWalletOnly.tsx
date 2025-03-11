import { useWalletCore } from '@core/chain-ui/providers/WalletCoreProvider'

import { ProductLogoBlock } from '../../ui/logo/ProductLogoBlock'

export const InitializedWalletOnly: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const walletCore = useWalletCore()

  if (!walletCore) {
    return <ProductLogoBlock />
  }

  return <>{children}</>
}
