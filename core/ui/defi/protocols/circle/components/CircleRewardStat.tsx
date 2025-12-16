import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { usdc } from '@core/chain/coin/knownTokens'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { IconProp, TitleProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'

type CircleRewardStatKind = 'regular' | 'primary'

type CircleRewardStatProps = IconProp &
  TitleProp &
  ValueProp<bigint> & {
    kind?: CircleRewardStatKind
  }

export const CircleRewardStat = ({
  icon,
  title,
  value,
  kind = 'regular',
}: CircleRewardStatProps) => {
  const formattedValue = formatAmount(fromChainAmount(value, usdc.decimals), {
    ticker: usdc.ticker,
  })

  return (
    <VStack gap={6} flexGrow>
      <HStack gap={4} alignItems="center">
        <IconWrapper size={16} color="textSupporting">
          {icon}
        </IconWrapper>
        <Text size={14} weight={500} color="supporting">
          {title}
        </Text>
      </HStack>
      <Text
        size={16}
        weight={500}
        color={kind === 'primary' ? 'success' : 'shyExtra'}
      >
        {kind === 'primary' ? '+' : ''}
        {formattedValue}
      </Text>
    </VStack>
  )
}
