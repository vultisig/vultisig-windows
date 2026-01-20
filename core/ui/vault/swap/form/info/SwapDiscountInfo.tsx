import { vult } from '@core/chain/coin/knownTokens'
import {
  VultDiscountTier,
  vultDiscountTierBps,
} from '@core/chain/swap/affiliate/config'
import { nativeSwapAffiliateConfig } from '@core/chain/swap/native/nativeSwapAffiliateConfig'
import { useAssertCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { useFriendReferralQuery } from '@core/ui/storage/referrals'
import { useVultDiscountTierQuery } from '@core/ui/vult/discount/queries/tier'
import { discountTierIcons } from '@core/ui/vult/discount/tier/icons'
import { MegaphoneIcon } from '@lib/ui/icons/MegaphoneIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMergeQueries } from '@lib/ui/query/hooks/useMergeQueries'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled, { keyframes } from 'styled-components'

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const RotatingIcon = styled.span`
  display: inline-flex;
  animation: ${rotate} 10s linear infinite;
`

const DiscountRow = styled(HStack)`
  color: ${getColor('textShy')};
  font-size: 12px;
`

const VultDiscountRow = ({ value: tier }: ValueProp<VultDiscountTier>) => {
  const { t } = useTranslation()
  const Icon = discountTierIcons[tier]
  const bps = vultDiscountTierBps[tier]

  return (
    <DiscountRow alignItems="center" gap={4}>
      <RotatingIcon>
        <Icon fontSize={16} />
      </RotatingIcon>
      <Text size={12} color="shy">
        {vult.ticker} {t(tier)}: -{bps}bps
      </Text>
    </DiscountRow>
  )
}

const ReferralDiscountRow = () => {
  const { t } = useTranslation()
  const bps = nativeSwapAffiliateConfig.referrerFeeRateBps

  return (
    <DiscountRow alignItems="center" gap={4}>
      <MegaphoneIcon fontSize={16} />
      <Text size={12} color="shy">
        {t('referrals_default_title')}: -{bps}bps
      </Text>
    </DiscountRow>
  )
}

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
