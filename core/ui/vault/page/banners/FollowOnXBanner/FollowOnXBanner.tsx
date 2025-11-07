import { CloseIcon } from '@lib/ui/icons/CloseIcon'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import {
  BackgroundPattern,
  BannerContainer,
  ButtonsRow,
  CloseButton,
  ContentWrapper,
  FollowButton,
  TextContent,
} from './FollowOnXBanner.styles'
import { VultisigLogoPattern } from './VultisigLogoPattern'

type FollowOnXBannerProps = {
  onDismiss: () => void
}

export const FollowOnXBanner = ({ onDismiss }: FollowOnXBannerProps) => {
  const { t } = useTranslation()

  const handleFollowClick = () => {
    window.open('https://x.com/Vultisig', '_blank', 'noopener,noreferrer')
  }

  return (
    <BannerContainer>
      <BackgroundPattern>
        <VultisigLogoPattern />
      </BackgroundPattern>

      <CloseButton onClick={onDismiss} aria-label="Close banner">
        <CloseIcon />
      </CloseButton>

      <ContentWrapper>
        <TextContent>
          <Text
            size={14}
            color="contrast"
            weight="400"
            style={{ opacity: 0.8 }}
          >
            {t('follow_banner_subtitle', 'Vultisig is building with you')}
          </Text>
          <Text size={20} color="contrast" weight="600">
            {t('follow_banner_title', 'Follow us on X')}
          </Text>
        </TextContent>

        <ButtonsRow>
          <FollowButton onClick={handleFollowClick}>
            {t('follow_banner_button', 'Follow @Vultisig')}
          </FollowButton>
        </ButtonsRow>
      </ContentWrapper>
    </BannerContainer>
  )
}
