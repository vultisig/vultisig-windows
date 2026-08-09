import { InfoCircleIcon } from '@lib/ui/icons/InfoCircleIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Container = styled(HStack)`
  background: ${getColor('foreground')};
  border-radius: 16px;
  padding: 16px;
`

/**
 * What a broadcast cancellation actually means, on the done screen.
 *
 * The success screen above says the transaction succeeded, which for a cancel is
 * a narrower claim than it looks: THORChain still has to observe the memo and
 * match it to a resting order, and until it does the order is unchanged. Left
 * unsaid, a user reads "sent" as "closed" and stops watching a position that is
 * still live.
 *
 * Not dismissible, unlike the placement hint: that one points at where to find
 * something, while this one qualifies what just happened.
 */
export const LimitOrderCancelDoneHint = () => {
  const { t } = useTranslation()

  return (
    <Container gap={12} alignItems="center">
      <Text color="supporting" centerVertically>
        <InfoCircleIcon />
      </Text>
      <VStack gap={2} style={{ flex: 1 }}>
        <Text size={14} weight={500} color="contrast">
          {t('swap_limit_cancel_sent')}
        </Text>
        <Text size={13} color="supporting">
          {t('swap_limit_cancel_sent_detail')}
        </Text>
      </VStack>
    </Container>
  )
}
