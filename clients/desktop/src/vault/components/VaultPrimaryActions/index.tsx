import { CoinKey } from '@core/chain/coin/Coin'
import { UniformColumnGrid } from '@lib/ui/css/uniformColumnGrid'
import { ValueProp } from '@lib/ui/props'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { isOneOf } from '@lib/utils/array/isOneOf'

import { swapEnabledChains } from '../../../chain/swap/swapEnabledChains'
import { SendPrompt } from '../../send/SendPrompt'
import { useCurrentVaultNativeCoins } from '../../state/currentVaultCoins'
import { SwapPrompt } from '../../swap/components/SwapPrompt'
import { DepositPrompt } from '../DepositPrompts'

export const VaultPrimaryActions = ({ value }: Partial<ValueProp<CoinKey>>) => {
  const nativeCoins = useCurrentVaultNativeCoins()

  if (isEmpty(nativeCoins)) {
    return null
  }

  const coinKey = value ?? nativeCoins[0]

  return (
    <UniformColumnGrid fullWidth gap={12}>
      <SendPrompt value={coinKey} />
      {isOneOf(coinKey.chain, swapEnabledChains) && (
        <SwapPrompt value={coinKey} />
      )}
      <DepositPrompt value={coinKey} />
    </UniformColumnGrid>
  )
}
