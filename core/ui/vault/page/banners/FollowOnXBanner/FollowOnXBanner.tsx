import { vultisigTwitterUrl } from '@core/ui/settings/constants'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { Image } from '@lib/ui/image/Image'
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

type FollowOnXBannerProps = {
  onDismiss: () => void
}

export const FollowOnXBanner = ({ onDismiss }: FollowOnXBannerProps) => {
  const { t } = useTranslation()

  const handleFollowClick = () => {
    window.open(vultisigTwitterUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <BannerContainer>
      <BackgroundPattern>
        <Image
          src="/core/images/thorchain-banner-bg.png"
          width={186}
          alt=""
          height={156}
        />
      </BackgroundPattern>

      <CloseButton onClick={onDismiss} kind="action">
        <CrossIcon />
      </CloseButton>

      <ContentWrapper>
        <TextContent>
          <Text
            size={13}
            color="contrast"
            weight="400"
            style={{ opacity: 0.7 }}
          >
            {t('follow_banner_subtitle')}
          </Text>
          <Text size={18} color="contrast" weight="600">
            {t('follow_banner_title')}
          </Text>
        </TextContent>

        <ButtonsRow>
          <FollowButton onClick={handleFollowClick}>
            {t('follow_banner_button')}
          </FollowButton>
        </ButtonsRow>
      </ContentWrapper>
    </BannerContainer>
  )
}
