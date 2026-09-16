import { ValueProp } from '@lib/ui/props'
import { Text, TextColor } from '@lib/ui/text'
import { match } from '@vultisig/lib-utils/match'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { PriceImpactDisplay, PriceImpactLevel } from './priceImpact'

const priceImpactColors: Record<PriceImpactLevel, TextColor> = {
  good: 'primary',
  average: 'idle',
  high: 'danger',
}

type GetPriceImpactLabelInput = {
  level: PriceImpactLevel
  t: TFunction
}

// Keys stay literal so the i18n integrity check can resolve them statically.
const getPriceImpactLabel = ({ level, t }: GetPriceImpactLabelInput) =>
  match(level, {
    good: () => t('price_impact_good'),
    average: () => t('price_impact_average'),
    high: () => t('price_impact_high'),
  })

/**
 * A formatted price impact with the colour and wording of its band.
 *
 * Shared because the initiator reads this figure from the quote it holds and a
 * co-signer reads it from the keysign payload. Two renderings of one value that
 * the two devices are meant to agree on cannot be allowed to drift apart.
 */
export const PriceImpactValue = ({ value }: ValueProp<PriceImpactDisplay>) => {
  const { t } = useTranslation()

  return (
    <Text as="span" color={priceImpactColors[value.level]}>
      {value.percent} ({getPriceImpactLabel({ level: value.level, t })})
    </Text>
  )
}
