import { usdc } from '@core/chain/coin/knownTokens'
import { UniformColumnGrid } from '@lib/ui/css/uniformColumnGrid'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { PercentIcon } from '@lib/ui/icons/PercentIcon'
import { LineSeparator } from '@lib/ui/layout/LineSeparator'
import { HStack, VStack, vStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { toPercents } from '@lib/utils/toPercents'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ChainEntityIcon } from '../../../../chain/coin/icon/ChainEntityIcon'
import { getCoinLogoSrc } from '../../../../chain/coin/icon/utils/getCoinLogoSrc'
import { CircleAccountFiatBalance } from '../banner/CircleAccountFiatBalance'
import { CircleDepositButton } from '../components/CircleDepositButton'
import { CircleWithdrawButton } from '../components/CircleWithdrawButton'
import { OpenCircleAccount } from '../components/OpenCircleAccount'
import { circleApy } from '../core/config'
import { useCircleAccountQuery } from '../queries/circleAccount'
import { useCircleAccountUsdcBalanceQuery } from '../queries/circleAccountUsdcBalance'
import { CircleAccountBalance } from './CircleAccountBalance'

export const CircleDepositedPanel = () => {
  const { data: circleAccount } = useCircleAccountQuery()
  const { data: circleBalance } = useCircleAccountUsdcBalanceQuery()
  const { t } = useTranslation()

  const hasBalance = circleBalance !== undefined && circleBalance > 0n

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
      <VStack gap={16}>
        {circleAccount && (
          <>
            <HStack alignItems="center" justifyContent="space-between">
              <HStack gap={4} alignItems="center">
                <IconWrapper size={16} color="textShy">
                  <PercentIcon />
                </IconWrapper>
                <Text size={14} weight={500} color="shy">
                  {t('circle.apy_approx')}
                </Text>
              </HStack>
              <Text size={16} weight={500} color="success">
                {toPercents(circleApy)}
              </Text>
            </HStack>
          </>
        )}
        {circleAccount ? (
          <UniformColumnGrid gap={16}>
            {hasBalance && <CircleWithdrawButton />}
            <CircleDepositButton />
          </UniformColumnGrid>
        ) : (
          <OpenCircleAccount />
        )}
      </VStack>
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
