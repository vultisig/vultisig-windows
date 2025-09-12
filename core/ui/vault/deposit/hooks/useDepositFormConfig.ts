import { useTranslation } from 'react-i18next'

import { useAssertWalletCore } from '../../../chain/providers/WalletCoreProvider'
import { useDepositAction } from '../providers/DepositActionProvider'
import { useDepositCoin } from '../providers/DepositCoinProvider'
import { getDepositFormConfig } from '../utils/getDepositFormConfig'
import { useDepositBalance } from './useDepositBalance'

export const useDepositFormConfig = () => {
  const [selectedChainAction] = useDepositAction()
  const walletCore = useAssertWalletCore()
  const [coin] = useDepositCoin()
  const { t } = useTranslation()

  const { balance } = useDepositBalance({
    selectedChainAction,
  })

  return getDepositFormConfig({
    coin,
    selectedChainAction,
    t,
    walletCore,
    totalAmountAvailable: balance,
  })
}
