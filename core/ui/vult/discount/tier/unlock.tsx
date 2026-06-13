import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { extractCoinKey } from '@vultisig/core-chain/coin/Coin'
import { vult } from '@vultisig/core-chain/coin/knownTokens'
import {
  VultDiscountTier,
  vultDiscountTierBps,
  vultDiscountTierMinBalances,
} from '@vultisig/core-chain/swap/affiliate/config'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { useCreateCoinMutation } from '../../../storage/coins'
import {
  discountTierFooterBackground,
  discountTierFooterOverlap,
} from './container'
import { discountTierIcons } from './icons'

const UnlockTierFooter = styled.button`
  display: flex;
  align-self: stretch;
  padding: ${discountTierFooterOverlap + 14}px 14px 14px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border: none;
  cursor: pointer;

  color: #f0f4fc;
  font-family: Brockmann;
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;

  &:hover {
    opacity: 0.92;
  }
`

export const UnlockDiscountTier = ({ value }: ValueProp<VultDiscountTier>) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const Icon = discountTierIcons[value]

  const { mutate: createCoin } = useCreateCoinMutation()

  const minBalance = formatAmount(vultDiscountTierMinBalances[value], {
    ticker: `$${vult.ticker}`,
  })

  const description =
    value === 'ultimate'
      ? t('unlock_discount_tier_description_ultimate', {
          tier: t(value),
          minBalance,
        })
      : t('unlock_discount_tier_description', {
          tier: t(value),
          minBalance,
          bps: vultDiscountTierBps[value],
        })

  return (
    <>
      <UnlockTierFooter
        style={{ background: discountTierFooterBackground(value) }}
        onClick={event => {
          event.stopPropagation()
          setIsOpen(true)
        }}
      >
        {t('unlock_tier')}
      </UnlockTierFooter>
      <ResponsiveModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        grabbable
      >
        <VStack alignItems="center" gap={26}>
          <VStack alignItems="center" gap={20}>
            <Icon fontSize={56} />
            <Text size={28} weight="500" centerHorizontally>
              {t('unlock_discount_tier', { tier: t(value) })}
            </Text>
            <Text size={14} weight="400" color="shy" centerHorizontally>
              {description}
            </Text>
          </VStack>
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
