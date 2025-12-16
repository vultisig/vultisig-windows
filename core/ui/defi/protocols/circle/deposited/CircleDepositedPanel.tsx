import { usdc } from '@core/chain/coin/knownTokens'
import { Button } from '@lib/ui/buttons/Button'
import { LineSeparator } from '@lib/ui/layout/LineSeparator'
import { HStack, VStack, vStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ChainEntityIcon } from '../../../../chain/coin/icon/ChainEntityIcon'
import { getCoinLogoSrc } from '../../../../chain/coin/icon/utils/getCoinLogoSrc'
import { CircleAccountFiatBalance } from '../banner/CircleAccountFiatBalance'
import { OpenCircleAccount } from '../components/OpenCircleAccount'
import { useCircleAccountQuery } from '../queries/circleAccount'
import { CircleAccountBalance } from './CircleAccountBalance'

export const CircleDepositedPanel = () => {
  const { data: circleAccount } = useCircleAccountQuery()
  const { t } = useTranslation()

  return (
    <Container>
      <HStack alignItems="center" gap={12}>
        <ChainEntityIcon
          style={{ fontSize: 48 }}
          value={getCoinLogoSrc(usdc.logo)}
        />
        <VStack gap={2}>
          <Text size={14} color="shy">
            {usdc.ticker} {t('deposited').toLowerCase()}
          </Text>
          <Text weight={500} size={28}>
            <CircleAccountBalance />
          </Text>
          <Text size={12} color="shy">
            {circleAccount && <CircleAccountFiatBalance />}
          </Text>
        </VStack>
      </HStack>
      <LineSeparator kind="regular" />
      {circleAccount ? (
        <Button>
          {t('circle.deposit')} {usdc.ticker}
        </Button>
      ) : (
        <OpenCircleAccount />
      )}
    </Container>
  )
}

const Container = styled.div`
  padding: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 16px;
  ${vStack({
    gap: 16,
  })}
`
