import { SwapFeeRowRenderer } from '@core/ui/vault/swap/form/info/swapFeeRow'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled from 'styled-components'

const Container = styled(HStack)`
  align-items: center;
  border-top: 1px solid ${getColor('foregroundExtra')};
  gap: 16px;
  justify-content: space-between;
  min-height: 56px;
  padding: 12px 24px;
`

const Value = styled(Text)`
  text-align: right;
`

type SwapVerifyRowProps = {
  label: ReactNode
  value: ReactNode
}

/**
 * One label/value line of the swap approval card. Separated by a hairline
 * rather than boxed, so the cost rows read as part of the card the amounts sit
 * in instead of as a list stacked beneath it.
 */
export const SwapVerifyRow = ({ label, value }: SwapVerifyRowProps) => (
  <Container>
    <Text color="shy" size={14}>
      {label}
    </Text>
    <Value as="div" color="contrast" size={14} weight="500">
      {value}
    </Value>
  </Container>
)

/** {@link SwapVerifyRow} in the shape the shared swap fee rows render through. */
export const renderSwapVerifyRow: SwapFeeRowRenderer = ({ label, value }) => (
  <SwapVerifyRow label={label} value={value} />
)
