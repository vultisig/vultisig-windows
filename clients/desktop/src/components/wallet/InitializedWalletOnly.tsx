import { useWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'

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
