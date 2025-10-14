import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { PercentIcon } from '@lib/ui/icons/PercentIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'

export const APYOverview = () => {
  return (
    <HStack justifyContent="space-between" alignItems="center" gap={8}>
      <HStack gap={4} alignItems="center">
        <IconWrapper size={16} color="textSupporting">
          <PercentIcon />
        </IconWrapper>
        <Text size={14} color="supporting">
          APY
        </Text>
      </HStack>
      <Text size={16} color="success">
        5.17%
      </Text>
    </HStack>
  )
}
