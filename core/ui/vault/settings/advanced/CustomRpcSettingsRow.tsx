import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { MobileSignalIcon } from '@lib/ui/icons/MobileSignalIcon'
import { ListItem } from '@lib/ui/list/item'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FeatureTierGate } from '../../../vult/discount/featureGate/FeatureTierGate'
import { useTierEligibility } from '../../../vult/discount/featureGate/useTierEligibility'
import {
  DescriptionText,
  ListItemIconWrapper,
} from '../vaultSettingsListStyles'

const requiredTier = 'silver'

/**
 * Custom RPC entry on the Advanced screen. App-wide custom RPC endpoints are a
 * Silver-tier perk, evaluated across ALL vaults: if any one vault qualifies the
 * user opens the chain list, otherwise they are routed to the discount tiers
 * upsell.
 */
export const CustomRpcSettingsRow = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const [isGateOpen, setIsGateOpen] = useState(false)
  const { isEligible, isPending } = useTierEligibility({ requiredTier })

  return (
    <>
      <ListItem
        icon={
          <ListItemIconWrapper>
            <MobileSignalIcon />
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
        title={t('custom_rpc')}
        hoverable
        showArrow
      />
      {isGateOpen ? (
        <FeatureTierGate
          isOpen={isGateOpen}
          onClose={() => setIsGateOpen(false)}
          icon={<MobileSignalIcon />}
          title={t('custom_rpc')}
          description={t('custom_rpc_gate_description')}
          requiredTier={requiredTier}
        />
      ) : null}
    </>
  )
}
