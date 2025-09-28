import { useAppNavigate } from '@clients/desktop/src/navigation/hooks/useAppNavigate'
import { Chain } from '@core/chain/Chain'
import { ChildrenProp } from '@lib/ui/props'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { useTranslation } from 'react-i18next'

import { useCurrentVaultAddresses } from '../../../state/currentVaultCoins'

export const ReferralsGuard = ({ children }: ChildrenProp) => {
  const hasThorchainAddress = useCurrentVaultAddresses()[Chain.THORChain]
  const navigate = useAppNavigate()
  const { addToast } = useToast()
  const { t } = useTranslation()

  if (!hasThorchainAddress) {
    addToast({
      message: t('thorchain_address_required_for_referrals'),
    })

    navigate({
      id: 'settings',
    })

    return null
  }

  return children
}
