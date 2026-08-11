import { FiatAmountText } from '@core/ui/chain/components/FiatAmountText'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type CoinPriceRangeBandProps = {
  low: number
  high: number
  current: number
}

/**
 * The 24h low–high band of the price range section: a slim track with a dot
 * marking where the current price sits between the extremes.
 */
export const CoinPriceRangeBand = ({
  low,
  high,
  current,
}: CoinPriceRangeBandProps) => {
  const { t } = useTranslation()

  const position = Math.min(1, Math.max(0, (current - low) / (high - low)))

  return (
    <Container gap={8}>
      <HStack justifyContent="space-between" fullWidth>
        <Text size={12} weight={500} color="shy">
          {t('low_24h')}
        </Text>
        <Text size={12} weight={500} color="shy">
          {t('high_24h')}
        </Text>
      </HStack>
      <Track>
        <Dot style={{ left: `calc(${position} * (100% - 8px))` }} />
      </Track>
      <HStack justifyContent="space-between" fullWidth>
        <Text size={13} weight={500} color="contrast">
          <FiatAmountText value={low} />
        </Text>
        <Text size={13} weight={500} color="contrast">
          <FiatAmountText value={high} />
        </Text>
      </HStack>
    </Container>
  )
}

const Container = styled(VStack)`
  padding: 12px 16px;
`

const Track = styled.div`
  position: relative;
  width: 100%;
  height: 4px;
  ${borderRadius.pill};
  background: ${getColor('foregroundExtra')};
`

const Dot = styled.div`
  position: absolute;
  top: 50%;
  width: 8px;
  height: 8px;
  ${borderRadius.pill};
  transform: translateY(-50%);
  background: ${getColor('primary')};
`
