import { usdc } from '@core/chain/coin/knownTokens'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { BannerContainer, BannerContent } from '../../../chain/banners/shared'
import { circleName } from '../core/config'
import { CircleAccountFiatBalance } from './CircleAccountFiatBalance'
import { CircleBannerLogo } from './CircleBannerLogo'

export const CircleBanner = () => {
  const { t } = useTranslation()

  return (
    <Container>
      <Logo fontSize={166} />
      <BannerContent gap={8}>
        <Text size={18} color="contrast">
          {circleName} {usdc.ticker} {t('account')}
        </Text>
        <Text size={28} weight={500}>
          <CircleAccountFiatBalance />
        </Text>
      </BannerContent>
    </Container>
  )
}

const Container = styled(BannerContainer)`
  border: 1px solid rgba(176, 144, 245, 0.17);
  background: linear-gradient(
    180deg,
    rgba(95, 191, 255, 0.09) 0%,
    rgba(95, 191, 255, 0) 100%
  );
`

const Logo = styled(CircleBannerLogo)`
  position: absolute;
  right: 0;
  bottom: 0;
  font-size: 166px;
`
