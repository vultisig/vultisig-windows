import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { Text } from '@lib/ui/text'

type Props = {
  value: number
}

export const CoinOptionFiatValue = ({ value }: Props) => {
  const formatFiatAmount = useFormatFiatAmount()

  return (
    <Text as="span" size={12} color="shy" weight={500}>
      {formatFiatAmount(value)}
    </Text>
  )
}
