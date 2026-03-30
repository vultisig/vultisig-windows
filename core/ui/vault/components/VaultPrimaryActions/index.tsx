import { SendPrompt } from '@core/ui/vault/send/SendPrompt'
import { banxaSupportedChains } from '@vultisig/core-chain/banxa'
import { Chain } from '@vultisig/core-chain/Chain'
import { CoinKey, extractCoinKey } from '@vultisig/core-chain/coin/Coin'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { useCallback, useMemo } from 'react'

import { depositEnabledChains } from '../../deposit/DepositEnabledChain'
import { useCurrentVaultCoins } from '../../state/currentVaultCoins'
import { useSwapEnabledChainsForVault } from '../../swap/state/useSwapEnabledChainsForVault'
import { BuyPrompt } from '../BuyPrompt'
import { DepositPrompt } from '../DepositPrompt'
import { ActionsWrapper } from '../PrimaryActions.styled'
import { ReceivePrompt } from '../ReceivePrompt'
import { SwapPrompt } from '../SwapPrompt'

type VaultPrimaryActionsProps = {
  coin?: CoinKey
  onReceive?: () => void
  showDepositAction?: boolean
}

export const VaultPrimaryActions = ({
  coin: potentialCoin,
  onReceive,
  showDepositAction = true,
}: VaultPrimaryActionsProps) => {
  const coins = useCurrentVaultCoins()
  const swapEnabledChainsForVault = useSwapEnabledChainsForVault()

  const sendCoin = useMemo(
    () => potentialCoin || coins[0],
    [coins, potentialCoin]
  )

  const getCoin = useCallback(
    (supportedChains: readonly Chain[]) => {
      const coin = (potentialCoin ? [potentialCoin] : coins).find(coin =>
        isOneOf(coin.chain, supportedChains)
      )

      if (coin) {
        return extractCoinKey(coin)
      }
    },
    [coins, potentialCoin]
  )

  const swapCoin = useMemo(
    () => getCoin(swapEnabledChainsForVault),
    [getCoin, swapEnabledChainsForVault]
  )
  const buyCoin = useMemo(() => getCoin(banxaSupportedChains), [getCoin])
  const depositCoin = useMemo(() => getCoin(depositEnabledChains), [getCoin])

  return (
    <ActionsWrapper justifyContent="center" gap={20}>
      {swapCoin && <SwapPrompt fromCoin={swapCoin} />}
      <SendPrompt coin={sendCoin} />
      {buyCoin && <BuyPrompt coin={buyCoin} />}
      {onReceive && <ReceivePrompt onClick={onReceive} />}
      {showDepositAction && depositCoin && <DepositPrompt coin={depositCoin} />}
    </ActionsWrapper>
  )
}
