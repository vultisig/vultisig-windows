import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled from 'styled-components'

type SolanaStakingInfoCardProps = {
  rows: Array<{ label: string; value: string }>
  notice?: ReactNode
}

/**
 * Shared read-only card for the account-scoped Solana staking screens (unstake /
 * withdraw / move / finish-move): a list of label → value rows plus an optional
 * info notice. Mirrors the read-only `FormPickerSection` rows on iOS.
 */
export const SolanaStakingInfoCard = ({
  rows,
  notice,
}: SolanaStakingInfoCardProps) => (
  <VStack gap={16} flexGrow>
    <Card>
      {rows.map(row => (
        <Row key={row.label}>
          <Text size={14} color="regular">
            {row.label}
          </Text>
          <Text size={14} color="shy" family="mono">
            {row.value}
          </Text>
        </Row>
      ))}
    </Card>
    {notice ? (
      <Notice>
        <Text size={13} color="shy">
          {notice}
        </Text>
      </Notice>
    ) : null}
  </VStack>
)

const Card = styled(VStack).attrs({ gap: 12 })`
  padding: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 12px;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const Notice = styled.div`
  padding: 12px 16px;
  border-radius: 12px;
  background: ${getColor('foreground')};
`
