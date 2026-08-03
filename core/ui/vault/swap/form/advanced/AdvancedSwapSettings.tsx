import { IconButton } from '@lib/ui/buttons/IconButton'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { SlidersVerticalIcon } from '@lib/ui/icons/SlidersVerticalIcon'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FeatureTierGate } from '../../../../vult/discount/featureGate/FeatureTierGate'
import { useTierBadge } from '../../../../vult/discount/featureGate/useTierBadge'
import { useAdvancedSwapSettings } from '../../state/advancedSettings'
import { AdvancedSwapSettingsSheet } from './AdvancedSwapSettingsSheet'

const requiredTier = 'silver'

/**
 * Advanced swap settings trigger. Slippage, gas limit and external recipient
 * overrides are a Silver-tier perk, evaluated across ALL vaults: if any one
 * vault qualifies the user opens the settings sheet, otherwise they are routed
 * to the discount tiers upsell, which explains the tier requirement.
 */
export const AdvancedSwapSettings = () => {
  const { t } = useTranslation()
  const [isOpen, { set: open, unset: close }] = useBoolean(false)
  const [isGateOpen, setIsGateOpen] = useState(false)
  const [settings, setSettings] = useAdvancedSwapSettings()
  const { isEligible, isPending } = useTierBadge({ requiredTier })

  return (
    <>
      <IconButton
        aria-label={t('advanced_settings')}
        data-testid="advanced-swap-settings"
        kind="secondary"
        onClick={() => {
          if (isPending) return
          if (isEligible) {
            open()
          } else {
            setIsGateOpen(true)
          }
        }}
        size="lg"
        title={t('advanced_settings')}
      >
        <IconWrapper size={20}>
          <SlidersVerticalIcon />
        </IconWrapper>
      </IconButton>
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
          icon={<SlidersVerticalIcon />}
          title={t('advanced_settings')}
          description={t('advanced_swap_settings_gate_description')}
          requiredTier={requiredTier}
        />
      ) : null}
    </>
  )
}
