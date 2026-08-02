import { TronResourceType } from '@vultisig/core-chain/chains/tron/resources'
import { useTranslation } from 'react-i18next'

import { useAssertWalletCore } from '../../../chain/providers/WalletCoreProvider'
import { useDepositAction } from '../providers/DepositActionProvider'
import { useDepositCoin } from '../providers/DepositCoinProvider'
import { getDepositFormConfig } from '../utils/getDepositFormConfig'
import { useDepositBalance } from './useDepositBalance'
import { useRippleTrustLineCostXrp } from './useRippleTrustLineCostXrp'

export const useDepositFormConfig = (tronResourceType?: TronResourceType) => {
  const [selectedChainAction] = useDepositAction()
  const walletCore = useAssertWalletCore()
  const [coin] = useDepositCoin()
  const { t } = useTranslation()

  const { balance, balanceUnits } = useDepositBalance({
    selectedChainAction,
    tronResourceType,
  })

  const trustLineCostXrp = useRippleTrustLineCostXrp(
    selectedChainAction === 'open_trust_line'
  )

  return getDepositFormConfig({
    coin,
    selectedChainAction,
    t,
    walletCore,
    totalAmountAvailable: balance,
    totalAmountAvailableUnits: balanceUnits,
    trustLineCostXrp,
  })
}
