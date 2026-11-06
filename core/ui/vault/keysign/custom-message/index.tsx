import { CustomMessageVerifyContent } from '@core/ui/mpc/keysign/custom/CustomMessageVerifyContent'
import { isSignableCustomMessage } from '@core/ui/mpc/keysign/customMessage/isSignableCustomMessage'
import { SettingsCtaButton } from '@core/ui/settings/SettingsCtaButton'
import { settingsOutlinedTextInput } from '@core/ui/settings/settingsField'
import { SettingsPageContent } from '@core/ui/settings/SettingsPageContent'
import { SettingsPageFooter } from '@core/ui/settings/SettingsPageFooter'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { Chain } from '@vultisig/core-chain/Chain'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { StartKeysignPrompt } from '../../../mpc/keysign/prompt/StartKeysignPrompt'
import { StartKeysignPromptProps } from '../../../mpc/keysign/prompt/StartKeysignPromptProps'
import { useCurrentVault } from '../../state/currentVault'
import { useCurrentVaultAddress } from '../../state/currentVaultCoins'
import { buildManualCustomMessagePayload } from './buildManualCustomMessagePayload'

const steps = ['form', 'verify'] as const

// The methods the unsupported-method error names. `isSignableCustomMessage`
// still has the final say on whether the payload can be signed.
const signingMethods = ['personal_sign', 'eth_signTypedData_v4'] as const

/**
 * Vault settings flow for signing a message the user types in, under a
 * signing method they name.
 */
export const SignCustomMessagePage = () => {
  const { step, toNextStep, toPreviousStep } = useStepNavigation({
    steps,
  })
  const { t } = useTranslation()

  const [method, setMethod] = useState('')
  const [isMethodTouched, setIsMethodTouched] = useState(false)
  const [message, setMessage] = useState('')
  const vault = useCurrentVault()
  const ethereumAddress = useCurrentVaultAddress(Chain.Ethereum)

  const isFillingForm = step === 'form'

  const custom = buildManualCustomMessagePayload({
    method,
    message,
    vaultPublicKeyEcdsa: getVaultId(vault),
  })

  const signingMethod = method.trim()

  const isMethodUnsupported =
    signingMethod !== '' && !isOneOf(signingMethod, signingMethods)

  const getDisabledMessage = () => {
    if (!ethereumAddress.trim()) {
      return t('sign_custom_message_unavailable_imported_no_ethereum')
    }
    if (!signingMethod) return t('method_required')
    if (isMethodUnsupported) return t('custom_message_unsupported_method')
    if (!message) return t('message_required')
    if (!isSignableCustomMessage(custom)) {
      return t('custom_message_unsupported_format')
    }
  }

  const disabledMessage = getDisabledMessage()

  const isMethodErrorShown = isMethodTouched && isMethodUnsupported

  const startKeysignPromptProps: StartKeysignPromptProps = disabledMessage
    ? { disabledMessage }
    : { keysignPayload: { custom } }

  return (
    <VStack fullHeight>
      <SettingsPageHeader
        onBack={!isFillingForm ? toPreviousStep : undefined}
        title={isFillingForm ? t('sign_message') : t('verify')}
      />
      <SettingsPageContent gap={24} flexGrow scrollable>
        {isFillingForm ? (
          <VStack gap={14}>
            <VStack gap={8}>
              <StyledTextInput
                value={method}
                onValueChange={setMethod}
                onBlur={() => setIsMethodTouched(true)}
                placeholder={t('signing_method')}
              />
              {isMethodErrorShown && (
                <Text size={12} color="danger">
                  {t('custom_message_unsupported_method')}
                </Text>
              )}
            </VStack>
            <StyledTextInput
              value={message}
              onValueChange={setMessage}
              placeholder={t('message_to_sign')}
            />
          </VStack>
        ) : (
          <CustomMessageVerifyContent
            method={method}
            message={message}
            isSettingsLook
          />
        )}
      </SettingsPageContent>
      {isFillingForm ? (
        <SettingsPageFooter>
          <SettingsCtaButton disabled={disabledMessage} onClick={toNextStep}>
            {t('continue')}
          </SettingsCtaButton>
        </SettingsPageFooter>
      ) : (
        <VerifyFooter>
          <StartKeysignPrompt {...startKeysignPromptProps} />
        </VerifyFooter>
      )}
    </VStack>
  )
}

const StyledTextInput = styled(TextInput)`
  ${settingsOutlinedTextInput};
`

const VerifyFooter = styled(SettingsPageFooter)`
  button {
    padding-top: 2px;
  }
`
