import { useAssertCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { useFriendReferralQuery } from '@core/ui/storage/referrals'
import { useVultDiscountTierQuery } from '@core/ui/vult/discount/queries/tier'
import { VStack } from '@lib/ui/layout/Stack'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMergeQueries } from '@lib/ui/query/hooks/useMergeQueries'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { ReferralDiscountRow } from './ReferralDiscountRow'
import { VultDiscountRow } from './VultDiscountRow'

export const SwapDiscountInfo = () => {
  const { t } = useTranslation()
  const vaultId = useAssertCurrentVaultId()

  const query = useMergeQueries({
    tier: useVultDiscountTierQuery(),
    referral: useFriendReferralQuery(vaultId),
  })

  return (
    <MatchQuery
      value={query}
      success={({ tier, referral }) => {
        if (!tier && !referral) return null

        return (
          <VStack gap={10}>
            <Text size={12} color="shy">
              {t('applied_discounts')}
            </Text>
            {tier && <VultDiscountRow value={tier} />}
            {referral && <ReferralDiscountRow />}
          </VStack>
        )
      }}
    />
  )
}
