import { VStack } from '@lib/ui/layout/Stack'
import { ChildrenProp, TitleProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

/**
 * Titled card grouping rows of the coin-detail modal (market stats, price
 * range, token info).
 */
export const CoinDetailSection = ({
  title,
  children,
}: TitleProp & ChildrenProp) => (
  <VStack gap={8} fullWidth>
    <Text size={13} weight={500} color="shy">
      {title}
    </Text>
    <Card>{children}</Card>
  </VStack>
)

const Card = styled(VStack)`
  width: 100%;
  border-radius: 12px;
  background: ${getColor('background')};
  padding: 4px 0;
`
