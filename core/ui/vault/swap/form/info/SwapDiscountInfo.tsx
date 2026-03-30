import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { SwapDiscount } from '@vultisig/core-chain/swap/discount/SwapDiscount'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { ReferralDiscountRow } from './ReferralDiscountRow'
import { VultDiscountRow } from './VultDiscountRow'

type SwapDiscountInfoProps = {
  discounts: SwapDiscount[]
}

export const SwapDiscountInfo = ({ discounts }: SwapDiscountInfoProps) => {
  const { t } = useTranslation()

  if (discounts.length === 0) return null

  return (
    <VStack gap={10}>
      <Text size={12} color="shy">
        {t('applied_discounts')}
      </Text>
      {discounts.map((discount, index) =>
        matchRecordUnion<SwapDiscount, ReactNode>(discount, {
          vult: ({ tier }) => <VultDiscountRow key={index} value={tier} />,
          referral: () => <ReferralDiscountRow key={index} />,
        })
      )}
    </VStack>
  )
}
