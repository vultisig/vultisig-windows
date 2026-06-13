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
import { CSSProperties, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { useCreateCoinMutation } from '../../../storage/coins'
import { DiscountTierFooterBox } from './container'
import { discountTierIcons } from './icons'

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
