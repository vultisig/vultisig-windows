import { HStack } from '@lib/ui/layout/Stack'
import { ChildrenProp, LabelProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'

export const TxFeeRow = ({ label, children }: LabelProp & ChildrenProp) => {
  return (
    <HStack alignItems="center" gap={4} justifyContent="space-between">
      <Text color="shy" weight="500">
        {label}
      </Text>
      {children}
    </HStack>
  )
}
