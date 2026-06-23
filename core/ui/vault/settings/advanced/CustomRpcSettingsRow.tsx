import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { RadioTowerIcon } from '@lib/ui/icons/RadioTowerIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { ListItem } from '@lib/ui/list/item'
import { Text } from '@lib/ui/text'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { FeatureTierGate } from '../../../vult/discount/featureGate/FeatureTierGate'
import { useVultDiscountTierQuery } from '../../../vult/discount/queries/tier'
import { hasReachedTier } from '../../../vult/discount/tierOrder'
import {
  DescriptionText,
  ListItemIconWrapper,
} from '../vaultSettingsListStyles'

const requiredTier = 'silver'

export const CustomRpcSettingsRow = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const [isGateOpen, setIsGateOpen] = useState(false)
  const tier = useVultDiscountTierQuery().data ?? null

  const isEligible = hasReachedTier({ current: tier, required: requiredTier })

  return (
    <>
      <ListItem
        icon={
          <ListItemIconWrapper>
            <RadioTowerIcon />
          </ListItemIconWrapper>
        }
        description={
          <DescriptionText>{t('custom_rpc_description')}</DescriptionText>
        }
        onClick={() =>
          isEligible ? navigate({ id: 'customRpc' }) : setIsGateOpen(true)
        }
        title={
          <HStack alignItems="center" gap={8}>
            <Text as="span">{t('custom_rpc')}</Text>
            <TierBadge>{t('vult_tier_required')}</TierBadge>
          </HStack>
        }
        hoverable
        showArrow
      />
      {isGateOpen ? (
        <FeatureTierGate
          isOpen={isGateOpen}
          onClose={() => setIsGateOpen(false)}
          icon={<RadioTowerIcon />}
          title={t('custom_rpc')}
          description={t('custom_rpc_gate_description')}
          requiredTier={requiredTier}
        />
      ) : null}
    </>
  )
}

const TierBadge = styled.span`
  background: ${({ theme }) => theme.colors.foregroundDark.toCssValue()};
  border: 1px solid ${({ theme }) => theme.colors.foregroundExtra.toCssValue()};
  border-radius: 99px;
  color: ${({ theme }) => theme.colors.primaryAccentFour.toCssValue()};
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.12px;
  line-height: 16px;
  padding: 3px 8px;
`
