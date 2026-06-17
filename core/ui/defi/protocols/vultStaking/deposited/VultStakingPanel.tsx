import { DeFiActionButton } from '@core/ui/defi/components/DeFiActionButton'
import { DefiFiatAmount } from '@core/ui/defi/shared/DefiFiatAmount'
import { DefiTokenAmount } from '@core/ui/defi/shared/DefiTokenAmount'
import { UniformColumnGrid } from '@lib/ui/css/uniformColumnGrid'
import { CircleMinusIcon } from '@lib/ui/icons/CircleMinusIcon'
import { CirclePlusIcon } from '@lib/ui/icons/CirclePlusIcon'
import { LineSeparator } from '@lib/ui/layout/LineSeparator'
import { HStack, VStack, vStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { sVultCoin, vultCoin } from '../core/config'
import { useStakedVultBalanceQuery } from '../queries/useStakedVultBalanceQuery'
import { useStakedVultFiatBalanceQuery } from '../queries/useStakedVultFiatBalanceQuery'
import { useVultStakingViewState } from '../state/vultStakingViewState'
import { VultLogoIcon } from '../VultLogoIcon'

export const VultStakingPanel = () => {
  const { t } = useTranslation()
  const [, setViewState] = useVultStakingViewState()
  const balanceQuery = useStakedVultBalanceQuery()
  const fiatBalanceQuery = useStakedVultFiatBalanceQuery()

  const hasStake = balanceQuery.data !== undefined && balanceQuery.data > 0n

  return (
    <Container>
      <HStack alignItems="center" gap={12}>
        <VultLogoIcon style={{ fontSize: 48 }} />
        <VStack gap={2}>
          <Text size={14} color="shy">
            {t('vultStaking.staked')}
          </Text>
          <Text weight={500} size={28}>
            <DefiTokenAmount
              query={balanceQuery}
              ticker={vultCoin.ticker}
              decimals={sVultCoin.decimals}
            />
          </Text>
          <Text size={12} color="shy">
            <DefiFiatAmount query={fiatBalanceQuery} />
          </Text>
        </VStack>
      </HStack>
      <LineSeparator kind="regular" />
      <UniformColumnGrid gap={16}>
        <DeFiActionButton
          kind="secondary"
          disabled={!hasStake}
          onClick={() => setViewState({ type: 'unstake' })}
          icon={<CircleMinusIcon />}
        >
          {t('vultStaking.unstake')}
        </DeFiActionButton>
        <DeFiActionButton
          onClick={() => setViewState({ type: 'stake' })}
          icon={<CirclePlusIcon />}
        >
          {t('vultStaking.stake')}
        </DeFiActionButton>
      </UniformColumnGrid>
    </Container>
  )
}

const Container = styled.div`
  padding: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 16px;
  ${vStack({ gap: 16 })}
`
