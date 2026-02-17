import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { ChildrenProp } from '@lib/ui/props'
import { setupStateProvider } from '@lib/ui/state/setupStateProvider'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { useCurrentVaultCoin } from '../../../state/currentVaultCoins'

const [InternalReferralPayoutAssetProvider, useInternalReferralPayoutAsset] =
  setupStateProvider<AccountCoin>('ReferralPayoutAssetProvider')

export const useReferralPayoutAsset = () => useInternalReferralPayoutAsset()

export const ReferralPayoutAssetProvider = ({ children }: ChildrenProp) => {
  const coin = shouldBePresent(
    useCurrentVaultCoin({
      chain: chainFeeCoin.THORChain.chain,
      id: chainFeeCoin.THORChain.id,
    })
  )

  return (
    <InternalReferralPayoutAssetProvider initialValue={coin}>
      {children}
    </InternalReferralPayoutAssetProvider>
  )
}
