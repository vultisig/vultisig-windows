import { Chain } from '@core/chain/Chain'
import { useNavigate } from '@lib/ui/navigation/hooks/useNavigate'
import { ChildrenProp } from '@lib/ui/props'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useCurrentVaultAddresses } from '../../../state/currentVaultCoins'

export const ReferralsGuard = ({ children }: ChildrenProp) => {
  const hasThorchainAddress = useCurrentVaultAddresses()[Chain.THORChain]
  const notEligibleForReferrals = !hasThorchainAddress

  const navigate = useNavigate()
  const { addToast } = useToast()
  const { t } = useTranslation()

  useEffect(() => {
    if (notEligibleForReferrals) {
      addToast({
        message: t('thorchain_address_required_for_referrals'),
      })

      navigate({
        id: 'settings',
      })
    }
  }, [addToast, notEligibleForReferrals, navigate, t])

  if (notEligibleForReferrals) return null

  return children
}
