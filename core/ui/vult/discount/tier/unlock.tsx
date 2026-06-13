import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { ValueProp } from '@lib/ui/props'
import { text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { extractCoinKey } from '@vultisig/core-chain/coin/Coin'
import { vult } from '@vultisig/core-chain/coin/knownTokens'
import {
  VultDiscountTier,
  vultDiscountTierBps,
  vultDiscountTierMinBalances,
} from '@vultisig/core-chain/swap/affiliate/config'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { CSSProperties, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { useCreateCoinMutation } from '../../../storage/coins'
import { discountTierColors } from './colors'
import { DiscountTierFooterBox } from './container'
import { discountTierIcons } from './icons'
import { UltimateGradientText } from './UltimateGradientText'

const Title = styled.p<ValueProp<VultDiscountTier>>`
  ${text({
    size: 28,
    centerHorizontally: true,
  })}

  b {
    color: ${({ value }) => discountTierColors[value].toCssValue()};
    font-weight: 500;
  }
`

const Description = styled.p`
  ${text({
    size: 14,
    centerHorizontally: true,
    color: 'shy',
    height: 'large',
  })}

  b {
    color: ${getColor('text')};
    font-weight: 600;
  }
`

type UnlockDiscountTierProps = ValueProp<VultDiscountTier> & {
  style?: CSSProperties
}

export const UnlockDiscountTier = ({
  value,
  style,
}: UnlockDiscountTierProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const Icon = discountTierIcons[value]

  const { mutate: createCoin } = useCreateCoinMutation()

  return (
    <>
      <DiscountTierFooterBox
        value={value}
        style={{ cursor: 'pointer', ...style }}
        onClick={event => {
          event.stopPropagation()
          setIsOpen(true)
        }}
      >
        {t('unlock_tier')}
      </DiscountTierFooterBox>
      <ResponsiveModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        grabbable
      >
        <VStack alignItems="center" gap={36} padding="8px 24px 24px">
          <VStack alignItems="center" gap={26}>
            <Icon fontSize={72} />
            <Title value={value}>
              <Trans
                i18nKey="unlock_discount_tier"
                values={{ tier: t(value) }}
                components={{
                  b: value === 'ultimate' ? <UltimateGradientText /> : <b />,
                }}
              />
            </Title>
          </VStack>
          <Description>
            <Trans
              i18nKey={
                value === 'ultimate'
                  ? 'unlock_discount_tier_description_ultimate'
                  : 'unlock_discount_tier_description'
              }
              values={{
                tier: t(value),
                minBalance: formatAmount(vultDiscountTierMinBalances[value], {
                  ticker: `$${vult.ticker}`,
                }),
                bps: vultDiscountTierBps[value],
              }}
              components={{ b: <b /> }}
            />
          </Description>
          <Button
            onClick={() =>
              createCoin(vult, {
                onSuccess: coin => {
                  navigate({
                    id: 'swap',
                    state: { toCoin: extractCoinKey(coin) },
                  })
                },
              })
            }
          >
            {t('unlock_tier')}
          </Button>
        </VStack>
      </ResponsiveModal>
    </>
  )
}
