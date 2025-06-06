import { Chain } from '@core/chain/Chain'
import { CoinKey } from '@core/chain/coin/Coin'
import { swapEnabledChains } from '@core/chain/swap/swapEnabledChains'
import { DepositPrompt } from '@core/ui/vault/components/DepositPrompts'
import { SendPrompt } from '@core/ui/vault/send/SendPrompt'
import { SwapPrompt } from '@core/ui/vault/swap/components/SwapPrompt'
import { UniformColumnGrid } from '@lib/ui/css/uniformColumnGrid'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { isOneOf } from '@lib/utils/array/isOneOf'

import { useCurrentVaultNativeCoins } from '../../state/currentVaultCoins'

type Props = {
  value?: CoinKey
  chain: Chain
}

export const VaultPrimaryActions = ({ value, chain }: Props) => {
  console.log('🚀 ~ VaultPrimaryActions ~ chain:', chain)
  const nativeCoins = useCurrentVaultNativeCoins()

  if (isEmpty(nativeCoins)) {
    return null
  }

  const coinKey = value ?? nativeCoins[0]

  return (
    <UniformColumnGrid fullWidth gap={12}>
      <SendPrompt
        value={{
          coin: value,
          chain: chain,
        }}
      />
      {isOneOf(coinKey.chain, swapEnabledChains) && (
        <SwapPrompt value={coinKey} />
      )}
      <DepositPrompt value={coinKey} />
    </UniformColumnGrid>
  )
}
