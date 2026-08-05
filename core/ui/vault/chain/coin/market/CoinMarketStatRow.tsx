import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { ReactNode } from 'react'
import styled from 'styled-components'

type CoinMarketStatRowProps = {
  label: ReactNode
  value: ReactNode
  subValue?: ReactNode
}

/**
 * One label/value line of a coin-detail section card, with an optional
 * secondary caption under the value (e.g. the ATH row's "% · date").
 */
export const CoinMarketStatRow = ({
  label,
  value,
  subValue,
}: CoinMarketStatRowProps) => (
  <Row>
    <Text size={13} weight={500} color="shy">
      {label}
    </Text>
    <VStack alignItems="flex-end" gap={2}>
      <Text
        size={13}
        weight={500}
        color="contrast"
        centerVertically={{ gap: 6 }}
      >
        {value}
      </Text>
      {subValue ? (
        <Text size={12} weight={500} color="shy">
          {subValue}
        </Text>
      ) : null}
    </VStack>
  </Row>
)

const Row = styled(HStack)`
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
`
