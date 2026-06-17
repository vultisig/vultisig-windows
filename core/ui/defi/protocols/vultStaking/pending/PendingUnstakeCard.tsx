import { Button } from '@lib/ui/buttons/Button'
import { HStack, VStack, vStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { sVultCoin, vultCoin } from '../core/config'
import { formatUnstakeMaturity } from '../core/formatUnstakeMaturity'
import { PendingUnstake } from '../core/getPendingUnstakes'
import { useVultStakingViewState } from '../state/vultStakingViewState'

type PendingUnstakeCardProps = {
  request: PendingUnstake
}

export const PendingUnstakeCard = ({ request }: PendingUnstakeCardProps) => {
  const { t, i18n } = useTranslation()
  const [, setViewState] = useVultStakingViewState()

  return (
    <Container>
      <VStack gap={4}>
        <Text size={14} weight={500}>
          {t('vultStaking.unstaking_amount', {
            amount: formatAmount(
              fromChainAmount(request.amount, sVultCoin.decimals),
              { ticker: vultCoin.ticker }
            ),
          })}
        </Text>
        <Text size={12} color="shy">
          {request.isClaimable
            ? t('vultStaking.ready_to_claim')
            : formatUnstakeMaturity(request.maturity, i18n.language)}
        </Text>
      </VStack>
      <HStack gap={8} alignItems="center">
        <Button
          kind="secondary"
          size="sm"
          onClick={() => setViewState({ type: 'cancel', request })}
        >
          {t('vultStaking.cancel')}
        </Button>
        <Button
          size="sm"
          disabled={!request.isClaimable}
          onClick={() => setViewState({ type: 'claim', request })}
        >
          {t('vultStaking.claim')}
        </Button>
      </HStack>
    </Container>
  )
}

const Container = styled.div`
  padding: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 16px;
  ${vStack({ gap: 12 })}
`
