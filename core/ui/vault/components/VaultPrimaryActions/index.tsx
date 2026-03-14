import { banxaSupportedChains } from '@core/chain/banxa'
import { Chain } from '@core/chain/Chain'
import { getMoneroVaultData } from '@core/chain/chains/monero/moneroVaultData'
import { getZcashVaultData } from '@core/chain/chains/zcash/zcashVaultData'
import { CoinKey, extractCoinKey } from '@core/chain/coin/Coin'
import { SendPrompt } from '@core/ui/vault/send/SendPrompt'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { useTranslation } from 'react-i18next'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { MoneroSyncPrompt } from '../../chain/moneroSync/MoneroSyncPrompt'
import { useMoneroBalanceScanStatus } from '../../chain/moneroSync/useMoneroBalanceScanStatus'
import { useZcashBalanceScanStatus } from '../../chain/zcashSync/useZcashBalanceScanStatus'
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
  const { t } = useTranslation()
  const coins = useCurrentVaultCoins()
  const swapEnabledChainsForVault = useSwapEnabledChainsForVault()
  const navigate = useCoreNavigate()

  const sendCoin = potentialCoin || coins[0]

  const isZcashSapling = potentialCoin?.chain === Chain.ZcashSapling
  const isMonero = potentialCoin?.chain === Chain.Monero

  const getCoin = (supportedChains: readonly Chain[]) => {
    const coin = (potentialCoin ? [potentialCoin] : coins).find(coin =>
      isOneOf(coin.chain, supportedChains)
    )
    if (coin) {
      return extractCoinKey(coin)
    }
  }

  const swapCoin = getCoin(swapEnabledChainsForVault)
  const buyCoin = getCoin(banxaSupportedChains)
  const depositCoin = getCoin(depositEnabledChains)

  const moneroVaultData = getMoneroVaultData()
  const zcashVaultData = getZcashVaultData()

  const {
    confirmingOutputs: moneroConfirming,
    confirmationsRemaining: moneroRemaining,
  } = useMoneroBalanceScanStatus({
    publicKeyEcdsa: isMonero ? moneroVaultData?.publicKeyEcdsa : undefined,
  })

  const {
    confirmingNotes: zcashConfirming,
    confirmationsRemaining: zcashRemaining,
  } = useZcashBalanceScanStatus({
    publicKeyEcdsa: isZcashSapling ? zcashVaultData?.publicKeyEcdsa : undefined,
  })

  let sendDisabledReason: string | undefined
  if (isMonero && moneroConfirming.length > 0) {
    sendDisabledReason = t('send_disabled_confirming', {
      count: moneroRemaining,
    })
  } else if (isZcashSapling && zcashConfirming.length > 0) {
    sendDisabledReason = t('send_disabled_confirming', {
      count: zcashRemaining,
    })
  }

  return (
    <ActionsWrapper justifyContent="center" gap={20}>
      {swapCoin && <SwapPrompt fromCoin={swapCoin} />}
      <SendPrompt coin={sendCoin} disabledReason={sendDisabledReason} />
      {buyCoin && <BuyPrompt coin={buyCoin} />}
      {onReceive && <ReceivePrompt onClick={onReceive} />}
      {showDepositAction && depositCoin && <DepositPrompt coin={depositCoin} />}
      {isZcashSapling && (
        <ZcashSyncPrompt onClick={() => navigate({ id: 'zcashBalanceScan' })} />
      )}
      {isMonero && (
        <MoneroSyncPrompt
          onClick={() => navigate({ id: 'moneroBalanceFinalise' })}
        />
      )}
    </ActionsWrapper>
  )
}
