import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { RadioTowerIcon } from '@lib/ui/icons/RadioTowerIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { ListItem } from '@lib/ui/list/item'
import { Text } from '@lib/ui/text'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FeatureTierGate } from '../../../vult/discount/featureGate/FeatureTierGate'
import { TierBadge } from '../../../vult/discount/featureGate/TierBadge'
import { useTierBadge } from '../../../vult/discount/featureGate/useTierBadge'
import {
  DescriptionText,
  ListItemIconWrapper,
} from '../vaultSettingsListStyles'

const requiredTier = 'silver'

/**
 * Custom RPC entry on the Advanced screen. App-wide custom RPC endpoints are a
 * Silver-tier perk, evaluated across ALL vaults: if any one vault qualifies the
 * user opens the chain list, otherwise they are routed to the discount tiers
 * upsell. The badge shows the user's highest tier.
 */
export const CustomRpcSettingsRow = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const [isGateOpen, setIsGateOpen] = useState(false)
  const { isEligible, isPending, badge } = useTierBadge({ requiredTier })

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
        onClick={() => {
          if (isPending) return
          if (isEligible) {
            navigate({ id: 'customRpc' })
          } else {
            setIsGateOpen(true)
          }
        }}
        title={
          <HStack alignItems="center" gap={8}>
            <Text as="span">{t('custom_rpc')}</Text>
            <TierBadge badge={badge} />
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
