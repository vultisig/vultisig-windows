import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { swapEnabledChains } from '@core/chain/swap/swapEnabledChains'
import { DepositPrompt } from '@core/ui/vault/components/DepositPrompts'
import { SendPrompt } from '@core/ui/vault/send/SendPrompt'
import { SwapPrompt } from '@core/ui/vault/swap/components/SwapPrompt'
import { UniformColumnGrid } from '@lib/ui/css/uniformColumnGrid'
import { isOneOf } from '@lib/utils/array/isOneOf'

import { CoreViewState } from '../../../navigation/CoreView'
import { depositEnabledChains } from '../../deposit/DepositEnabledChain'
import { useCurrentVaultCoin } from '../../state/currentVaultCoins'

export const VaultPrimaryActions = (state: CoreViewState<'send'>) => {
  const chain = 'fromChain' in state ? state.fromChain : state.coin.chain
  const feeCoin = useCurrentVaultCoin({ chain, id: chainFeeCoin[chain].id })
  const coin = 'coin' in state ? state.coin : feeCoin

  return (
    <UniformColumnGrid fullWidth gap={12}>
      {isOneOf(chain, swapEnabledChains) && <SwapPrompt fromCoin={coin} />}
      <SendPrompt {...state} />
      {isOneOf(chain, depositEnabledChains) && <DepositPrompt coin={coin} />}
    </UniformColumnGrid>
  )
}
