import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { swapEnabledChains } from '@core/chain/swap/swapEnabledChains'
import { SendPrompt } from '@core/ui/vault/send/SendPrompt'
import { isOneOf } from '@lib/utils/array/isOneOf'

import { CoreViewState } from '../../../navigation/CoreView'
import { depositEnabledChains } from '../../deposit/DepositEnabledChain'
import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
import { DepositPrompt } from '../DepositPrompt'
import { ActionsWrapper } from '../PrimaryActions.styled'
import { SwapPrompt } from '../SwapPrompt'

export const VaultPrimaryActions = (state: CoreViewState<'send'>) => {
  const chain = 'fromChain' in state ? state.fromChain : state.coin.chain
  const feeCoin = useCurrentVaultCoin({ chain, id: chainFeeCoin[chain].id })
  const coin = 'coin' in state ? state.coin : feeCoin

  return (
    <ActionsWrapper justifyContent="center" gap={20}>
      {isOneOf(chain, swapEnabledChains) && <SwapPrompt fromCoin={coin} />}
      <SendPrompt {...state} />
      {isOneOf(chain, depositEnabledChains) && <DepositPrompt coin={coin} />}
    </ActionsWrapper>
  )
}
