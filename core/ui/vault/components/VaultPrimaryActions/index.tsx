import { CoinKey } from '@core/chain/coin/Coin'
import { swapEnabledChains } from '@core/chain/swap/swapEnabledChains'
import { DepositPrompt } from '@core/ui/vault/components/DepositPrompts'
import { SendPrompt } from '@core/ui/vault/send/SendPrompt'
import { useCurrentVaultNativeCoins } from '@core/ui/vault/state/currentVaultCoins'
import { SwapPrompt } from '@core/ui/vault/swap/components/SwapPrompt'
import { UniformColumnGrid } from '@lib/ui/css/uniformColumnGrid'
import { ValueProp } from '@lib/ui/props'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { isOneOf } from '@lib/utils/array/isOneOf'

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
