import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import styled from 'styled-components'

type LimitSwapNoticeProps = {
  kind: 'blocker' | 'warning'
  message: string
}

/**
 * Inline reason an order cannot be placed, or an advisory about a price that
 * can.
 *
 * A blocker always states why placement is unavailable rather than leaving a
 * disabled button unexplained; a warning never blocks.
 */
export const LimitSwapNotice: FC<LimitSwapNoticeProps> = ({
  kind,
  message,
}) => (
  <Notice>
    <Text size={12} color={kind === 'blocker' ? 'danger' : 'warning'}>
      {message}
    </Text>
  </Notice>
)

const Notice = styled(HStack)`
  padding: 10px 12px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.foregroundExtra.toCssValue()};
`
