import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { ReactNode } from 'react'

type RevokeApprovalDetailRowProps = {
  label: string
  value: ReactNode
}

/** Label on the left, value on the right, as in the other verify screens. */
export const RevokeApprovalDetailRow = ({
  label,
  value,
}: RevokeApprovalDetailRowProps) => (
  <HStack justifyContent="space-between" alignItems="center" gap={8}>
    <Text size={13} color="shy">
      {label}
    </Text>
    <Text size={13} weight={500} color="contrast">
      {value}
    </Text>
  </HStack>
)
