import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { ReactNode } from 'react'

type BondYieldInfoRowProps = {
  label: string
  children: ReactNode
}

/** One label and value row of the Rewards Payout node summary. */
export const BondYieldInfoRow = ({
  label,
  children,
}: BondYieldInfoRowProps) => (
  <HStack justifyContent="space-between" alignItems="center">
    <Text size={14} weight="500" color="shy">
      {label}
    </Text>
    <Text size={14} weight="500" color="shyExtra">
      {children}
    </Text>
  </HStack>
)
