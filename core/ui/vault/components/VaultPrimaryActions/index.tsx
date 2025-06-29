import { swapEnabledChains } from '@core/chain/swap/swapEnabledChains'
import { DepositPrompt } from '@core/ui/vault/components/DepositPrompts'
import { SendPrompt } from '@core/ui/vault/send/SendPrompt'
import { SwapPrompt } from '@core/ui/vault/swap/components/SwapPrompt'
import { UniformColumnGrid } from '@lib/ui/css/uniformColumnGrid'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { isOneOf } from '@lib/utils/array/isOneOf'

import { CoreViewState } from '../../../navigation/CoreView'
import { useCurrentVaultNativeCoins } from '../../state/currentVaultCoins'

export const VaultPrimaryActions = (state: CoreViewState<'send'>) => {
  const nativeCoins = useCurrentVaultNativeCoins()

  if (isEmpty(nativeCoins)) {
    return null
  }

  const coinKey = state.coin ?? nativeCoins[0]

  return (
    <UniformColumnGrid fullWidth gap={12}>
      <SendPrompt {...state} />
      {isOneOf(coinKey.chain, swapEnabledChains) && (
        <SwapPrompt value={coinKey} />
      )}
      <DepositPrompt value={coinKey} />
    </UniformColumnGrid>
  )
}
