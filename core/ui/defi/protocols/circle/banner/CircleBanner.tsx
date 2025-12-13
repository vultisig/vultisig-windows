import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { BannerContainer, BannerContent } from '../../../chain/banners/shared'
import { CircleBannerLogo } from './CircleBannerLogo'

export const CircleBanner = () => {
  const { t } = useTranslation()

  return (
    <BannerContainer>
      <Logo fontSize={166} />
      <BannerContent gap={8}>
        <Text size={18} color="contrast">
          Circle USDC {t('account')}
        </Text>
      </BannerContent>
    </BannerContainer>
  )
}

const Logo = styled(CircleBannerLogo)`
  position: absolute;
  right: 0;
  bottom: 0;
  font-size: 166px;
`
