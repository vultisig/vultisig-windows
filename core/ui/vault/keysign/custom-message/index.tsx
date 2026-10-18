import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { CustomMessageVerifyContent } from '@core/ui/mpc/keysign/custom/CustomMessageVerifyContent'
import { isSignableCustomMessage } from '@core/ui/mpc/keysign/customMessage/isSignableCustomMessage'
import { Button } from '@lib/ui/buttons/Button'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Chain } from '@vultisig/core-chain/Chain'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { StartKeysignPrompt } from '../../../mpc/keysign/prompt/StartKeysignPrompt'
import { StartKeysignPromptProps } from '../../../mpc/keysign/prompt/StartKeysignPromptProps'
import { useCurrentVault } from '../../state/currentVault'
import { useCurrentVaultAddress } from '../../state/currentVaultCoins'
import { buildManualCustomMessagePayload } from './buildManualCustomMessagePayload'

const steps = ['form', 'verify'] as const

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

  // The form wraps a personal_sign message in its envelope itself, so only
  // the method can make the payload unsignable.
  const isMethodUnsupported =
    method.trim() !== '' && !isSignableCustomMessage(custom)

  const getDisabledMessage = () => {
    if (!ethereumAddress.trim()) {
      return t('sign_custom_message_unavailable_imported_no_ethereum')
    }
    if (!method.trim()) return t('method_required')
    if (isMethodUnsupported) return t('custom_message_unsupported_method')
    if (!message) return t('message_required')
  }

  const disabledMessage = getDisabledMessage()

  const isMethodErrorShown = isMethodTouched && isMethodUnsupported

  const startKeysignPromptProps: StartKeysignPromptProps = disabledMessage
    ? { disabledMessage }
    : { keysignPayload: { custom } }

  return (
    <VStack fullHeight>
      <FlowPageHeader
        onBack={!isFillingForm ? toPreviousStep : undefined}
        title={isFillingForm ? t('sign_message') : t('verify')}
      />
      <PageContent gap={24} flexGrow scrollable>
        {isFillingForm ? (
          <VStack gap={16}>
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
          <CustomMessageVerifyContent method={method} message={message} />
        )}
      </PageContent>
      <PageFooter>
        {isFillingForm ? (
          <Button disabled={disabledMessage} onClick={toNextStep}>
            {t('continue')}
          </Button>
        ) : (
          <StartKeysignPrompt {...startKeysignPromptProps} />
        )}
      </PageFooter>
    </VStack>
  )
}

const StyledTextInput = styled(TextInput)`
  font-weight: 500;
  padding-left: 16px;
  border: 1px solid ${getColor('foregroundExtra')};

  &::placeholder {
    font-weight: 500;
    font-size: 16px;
  }
`
