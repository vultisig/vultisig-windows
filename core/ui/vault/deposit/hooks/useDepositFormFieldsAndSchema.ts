import { useTranslation } from 'react-i18next'

import { useAssertWalletCore } from '../../../chain/providers/WalletCoreProvider'
import { useDepositAction } from '../providers/DepositActionProvider'
import { useDepositCoin } from '../providers/DepositCoinProvider'
import { getFunctionFormConfig } from '../utils/getFunctionFormConfig'
import { useDepositBalance } from './useDepositBalance'

export const useDepositFormFieldsAndSchema = () => {
  const [selectedChainAction] = useDepositAction()
  const walletCore = useAssertWalletCore()
  const [coin] = useDepositCoin()
  const { t } = useTranslation()

  const { balance } = useDepositBalance({
    selectedChainAction,
  })

  return getFunctionFormConfig({
    coin,
    selectedChainAction,
    t,
    walletCore,
    totalAmountAvailable: balance,
  })
}
