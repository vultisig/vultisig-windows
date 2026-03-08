import { banxaSupportedChains } from '@core/chain/banxa'
import { Chain } from '@core/chain/Chain'
import { CoinKey, extractCoinKey } from '@core/chain/coin/Coin'
import { SendPrompt } from '@core/ui/vault/send/SendPrompt'
import { Opener } from '@lib/ui/base/Opener'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { useCallback, useMemo } from 'react'

import { MoneroSyncModal } from '../../chain/moneroSync/MoneroSyncModal'
import { MoneroSyncPrompt } from '../../chain/moneroSync/MoneroSyncPrompt'
import { ZcashSyncModal } from '../../chain/zcashSync/ZcashSyncModal'
import { ZcashSyncPrompt } from '../../chain/zcashSync/ZcashSyncPrompt'
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

  const isZcashShielded = potentialCoin?.chain === Chain.ZcashShielded
  const isMonero = potentialCoin?.chain === Chain.Monero

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
      {isZcashShielded && (
        <Opener
          renderOpener={({ onOpen }) => <ZcashSyncPrompt onClick={onOpen} />}
          renderContent={({ onClose }) => <ZcashSyncModal onClose={onClose} />}
        />
      )}
      {isMonero && (
        <Opener
          renderOpener={({ onOpen }) => <MoneroSyncPrompt onClick={onOpen} />}
          renderContent={({ onClose }) => <MoneroSyncModal onClose={onClose} />}
        />
      )}
    </ActionsWrapper>
  )
}
