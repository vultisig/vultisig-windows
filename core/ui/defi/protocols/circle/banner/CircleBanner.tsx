import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { BannerContainer, BannerContent } from '../../../chain/banners/shared'
import { useCircleAccountQuery } from '../queries/circleAccount'
import { CircleAccountFiatBalance } from './CircleAccountFiatBalance'
import { CircleBannerLogo } from './CircleBannerLogo'

export const CircleBanner = () => {
  const { t } = useTranslation()
  const { data: circleAccount } = useCircleAccountQuery()

  return (
    <BannerContainer>
      <Logo fontSize={166} />
      <BannerContent gap={8}>
        <Text size={18} color="contrast">
          Circle USDC {t('account')}
        </Text>
        {circleAccount && (
          <Text size={28} weight={500}>
            <CircleAccountFiatBalance />
          </Text>
        )}
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
