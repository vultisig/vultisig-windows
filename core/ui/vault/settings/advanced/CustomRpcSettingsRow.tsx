import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { GlobusIcon } from '@lib/ui/icons/GlobusIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { ListItem } from '@lib/ui/list/item'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { useVultDiscountTierQuery } from '../../../vult/discount/queries/tier'
import { discountTierColors } from '../../../vult/discount/tier/colors'
import { hasReachedTier } from '../../../vult/discount/tierOrder'
import {
  DescriptionText,
  ListItemIconWrapper,
} from '../vaultSettingsListStyles'

/**
 * Custom RPC entry on the Advanced screen. App-wide custom RPC endpoints are a
 * Silver-tier perk: a qualifying user opens the chain list, while everyone else
 * is routed to the discount tiers upsell.
 */
export const CustomRpcSettingsRow = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const { data: tier } = useVultDiscountTierQuery()
  const theme = useTheme()

  const isEligible = hasReachedTier({
    current: tier ?? null,
    required: 'silver',
  })

  const badgeColor =
    isEligible && tier
      ? discountTierColors[tier].toCssValue()
      : theme.colors.textShy.toCssValue()
  const badgeLabel =
    isEligible && tier
      ? t('vult_tier_label', { tier: t(tier) })
      : t('vult_tier_required')

  return (
    <ListItem
      icon={
        <ListItemIconWrapper>
          <GlobusIcon />
        </ListItemIconWrapper>
      }
      description={
        <DescriptionText>{t('custom_rpc_description')}</DescriptionText>
      }
      onClick={() =>
        navigate(isEligible ? { id: 'customRpc' } : { id: 'vultDiscount' })
      }
      title={
        <HStack alignItems="center" gap={8}>
          <Text as="span">{t('custom_rpc')}</Text>
          <TierBadge $color={badgeColor}>{badgeLabel}</TierBadge>
        </HStack>
      }
      hoverable
      showArrow
    />
  )
}

const TierBadge = styled.span<{ $color: string }>`
  border: 1px solid ${({ $color }) => $color};
  border-radius: 99px;
  color: ${({ $color }) => $color};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
  padding: 2px 8px;
`
