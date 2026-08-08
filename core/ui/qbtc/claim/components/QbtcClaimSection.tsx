import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Button } from '@lib/ui/buttons/Button'
import { useTranslation } from 'react-i18next'

/** Bottom-pinned CTA on the QBTC chain detail page that takes the user into
 * the claim flow. Lives outside the scroll area so it stays anchored above
 * the BottomNavigation while the asset list scrolls. */
export const QbtcClaimSection = () => {
  const navigate = useCoreNavigate()
  const { t } = useTranslation()

  return (
    <Button kind="primary" onClick={() => navigate({ id: 'qbtcClaim' })}>
      {t('qbtc_claim_section_cta')}
    </Button>
  )
}
