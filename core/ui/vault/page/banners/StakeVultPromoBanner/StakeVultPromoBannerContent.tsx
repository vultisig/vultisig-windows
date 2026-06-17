import { VultStakingBannerLogo } from '@core/ui/defi/protocols/vultStaking/VultStakingBannerLogo'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { BannerPromoCtaButton } from '../shared/BannerPromoCtaButton.styles'
import {
  BannerRoot,
  CloseButton,
  Content,
  TextStack,
} from './StakeVultPromoBanner.styles'

type StakeVultPromoBannerContentProps = {
  onStake: () => void
  onDismiss: () => void
}

/** Presentational stake-VULT nudge — visuals only, all behavior via props. */
export const StakeVultPromoBannerContent = ({
  onStake,
  onDismiss,
}: StakeVultPromoBannerContentProps) => {
  const { t } = useTranslation()

  return (
    <BannerRoot data-testid="stake-vult-promo-banner">
      <CloseButton size="lg" onClick={onDismiss} aria-label={t('close')}>
        <CrossIcon style={{ fontSize: 16 }} />
      </CloseButton>

      <Content>
        <TextStack>
          <Text variant="caption" color="shy">
            {t('vultStaking.banner_title')}
          </Text>
          <Text size={14} weight={500} height={20 / 14} color="regular">
            {t('vultStaking.banner_subtitle')}
          </Text>
        </TextStack>

        <BannerPromoCtaButton onClick={onStake}>
          {t('vultStaking.banner_cta')}
        </BannerPromoCtaButton>
      </Content>

      <VultStakingBannerLogo width={158} />
    </BannerRoot>
  )
}
