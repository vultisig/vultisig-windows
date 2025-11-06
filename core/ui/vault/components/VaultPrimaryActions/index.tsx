import { banxaSupportedChains } from '@core/chain/banxa'
import { Chain } from '@core/chain/Chain'
import { CoinKey } from '@core/chain/coin/Coin'
import { swapEnabledChains } from '@core/chain/swap/swapEnabledChains'
import { SendPrompt } from '@core/ui/vault/send/SendPrompt'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { useCallback, useMemo } from 'react'

import { depositEnabledChains } from '../../deposit/DepositEnabledChain'
import { useCurrentVaultCoins } from '../../state/currentVaultCoins'
import { BuyPrompt } from '../BuyPrompt'
import { DepositPrompt } from '../DepositPrompt'
import { ActionsWrapper } from '../PrimaryActions.styled'
import { ReceivePrompt } from '../ReceivePrompt'
import { SwapPrompt } from '../SwapPrompt'

type VaultPrimaryActionsProps = {
  coin?: CoinKey
  onReceive?: () => void
  showActions?: boolean
}

export const VaultPrimaryActions = ({
  coin: potentialCoin,
  onReceive,
  showActions = true,
}: VaultPrimaryActionsProps) => {
  const coins = useCurrentVaultCoins()

  const sendCoin = useMemo(
    () => potentialCoin || coins[0],
    [coins, potentialCoin]
  )

  const getCoin = useCallback(
    (supportedChains: readonly Chain[]) =>
      (potentialCoin ? [potentialCoin] : coins).find(coin =>
        isOneOf(coin.chain, supportedChains)
      ),
    [coins, potentialCoin]
  )

  const swapCoin = useMemo(() => getCoin(swapEnabledChains), [getCoin])
  const buyCoin = useMemo(() => getCoin(banxaSupportedChains), [getCoin])
  const depositCoin = useMemo(() => getCoin(depositEnabledChains), [getCoin])

  return (
    <ActionsWrapper justifyContent="center" gap={20}>
      {swapCoin && <SwapPrompt fromCoin={swapCoin} />}
      <SendPrompt coin={sendCoin} />
      {buyCoin && <BuyPrompt coin={buyCoin} />}
      {onReceive && <ReceivePrompt onClick={onReceive} />}
      {showActions && depositCoin && <DepositPrompt coin={depositCoin} />}
    </ActionsWrapper>
  )
}
