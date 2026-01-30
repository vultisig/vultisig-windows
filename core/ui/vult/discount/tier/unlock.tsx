import { extractCoinKey } from '@core/chain/coin/Coin'
import { vult } from '@core/chain/coin/knownTokens'
import {
  VultDiscountTier,
  vultDiscountTierBps,
  vultDiscountTierMinBalances,
} from '@core/chain/swap/affiliate/config'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { ValueProp } from '@lib/ui/props'
import { text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatAmount } from '@lib/utils/formatAmount'
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { useCreateCoinMutation } from '../../../storage/coins'
import { discountTierColors } from './colors'
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

const UnlockButton = styled.button`
  display: flex;
  height: 44px;
  padding: 12px 24px;
  justify-content: center;
  align-items: center;
  gap: 4px;
  align-self: stretch;
  border-radius: 99px;
  border: 1px solid #4879fd;
  background: #11284a;
  cursor: pointer;

  color: #f0f4fc;
  font-family: Brockmann;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;

  &:hover {
    opacity: 0.9;
  }
`

export const UnlockDiscountTier = ({ value }: ValueProp<VultDiscountTier>) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const Icon = discountTierIcons[value]

  const { mutate: createCoin } = useCreateCoinMutation()

  return (
    <>
      <UnlockButton onClick={() => setIsOpen(true)}>
        {t('unlock_tier')}
      </UnlockButton>
      <ResponsiveModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        grabbable
      >
        <VStack alignItems="center" gap={36}>
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
