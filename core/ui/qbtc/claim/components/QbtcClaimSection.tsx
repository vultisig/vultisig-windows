import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Button } from '@lib/ui/buttons/Button'
import { useTranslation } from 'react-i18next'

/** Button section displayed on the QBTC chain detail page to navigate to the claim flow. */
export const QbtcClaimSection = () => {
  const navigate = useCoreNavigate()
  const { t } = useTranslation()

  return (
    <Button kind="outlined" onClick={() => navigate({ id: 'qbtcClaim' })}>
      {t('qbtc_claim_title')}
    </Button>
  )
}
