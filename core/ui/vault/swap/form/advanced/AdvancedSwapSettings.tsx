import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { SettingsIcon } from '@lib/ui/icons/SettingsIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { FeatureTierGate } from '../../../../vult/discount/featureGate/FeatureTierGate'
import { TierBadge } from '../../../../vult/discount/featureGate/TierBadge'
import { useTierBadge } from '../../../../vult/discount/featureGate/useTierBadge'
import { useAdvancedSwapSettings } from '../../state/advancedSettings'
import { AdvancedSwapSettingsSheet } from './AdvancedSwapSettingsSheet'

const requiredTier = 'silver'

/**
 * Advanced swap settings trigger. Slippage, gas limit and external recipient
 * overrides are a Silver-tier perk, evaluated across ALL vaults: if any one
 * vault qualifies the user opens the settings sheet, otherwise they are routed
 * to the discount tiers upsell. The badge shows the user's highest tier.
 */
export const AdvancedSwapSettings = () => {
  const { t } = useTranslation()
  const [isOpen, { set: open, unset: close }] = useBoolean(false)
  const [isGateOpen, setIsGateOpen] = useState(false)
  const [settings, setSettings] = useAdvancedSwapSettings()
  const { isEligible, isPending, badge } = useTierBadge({ requiredTier })

  return (
    <>
      <Trigger
        onClick={() => {
          if (isPending) return
          if (isEligible) {
            open()
          } else {
            setIsGateOpen(true)
          }
        }}
      >
        <HStack alignItems="center" gap={8}>
          <Text size={14} color="shy">
            {t('advanced_settings')}
          </Text>
          <TierBadge badge={badge} />
        </HStack>
      </Trigger>
      {isOpen && (
        <AdvancedSwapSettingsSheet
          onClose={close}
          slippage={settings.slippage}
          onSlippageChange={slippage =>
            setSettings(prev => ({ ...prev, slippage }))
          }
          gasLimit={settings.gasLimit}
          onGasLimitChange={gasLimit =>
            setSettings(prev => ({ ...prev, gasLimit }))
          }
          externalRecipient={settings.externalRecipient}
          onExternalRecipientChange={externalRecipient =>
            setSettings(prev => ({ ...prev, externalRecipient }))
          }
        />
      )}
      {isGateOpen ? (
        <FeatureTierGate
          isOpen={isGateOpen}
          onClose={() => setIsGateOpen(false)}
          icon={<SettingsIcon />}
          title={t('advanced_settings')}
          description={t('advanced_swap_settings_gate_description')}
          requiredTier={requiredTier}
        />
      ) : null}
    </>
  )
}

const Trigger = styled(UnstyledButton)`
  align-self: center;

  &:hover {
    opacity: 0.8;
  }
`
