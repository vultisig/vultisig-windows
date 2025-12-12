import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { BannerContainer, BannerContent } from '../../../chain/banners/shared'
import { CircleBannerLogo } from './CircleBannerLogo'

export const CircleBanner = () => {
  const { t } = useTranslation()

  return (
    <BannerContainer>
      <PositionLogo>
        <CircleBannerLogo fontSize={166} />
      </PositionLogo>
      <BannerContent gap={8}>
        <Text size={18} color="contrast">
          Circle USDC {t('account')}
        </Text>
      </BannerContent>
    </BannerContainer>
  )
}

const PositionLogo = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
`
