import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAdvancedSwapSettings } from '../../state/advancedSettings'
import { AdvancedSwapSettingsSheet } from './AdvancedSwapSettingsSheet'

export const AdvancedSwapSettings = () => {
  const { t } = useTranslation()
  const [isOpen, { set: open, unset: close }] = useBoolean(false)
  const [settings, setSettings] = useAdvancedSwapSettings()

  return (
    <>
      <Trigger onClick={open}>
        <Text size={14} color="shy" centerHorizontally>
          {t('advanced_settings')}
        </Text>
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
    </>
  )
}

const Trigger = styled(UnstyledButton)`
  align-self: center;
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover {
    opacity: 0.8;
  }
`
