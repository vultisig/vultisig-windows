import { Button } from '@lib/ui/buttons/Button'
import { DevicesIcon } from '@lib/ui/icons/DevicesIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { VaultSecurityType } from '../../../vault/VaultSecurityType'
import {
  FastVaultPasswordModal,
  FastVaultPasswordModalResult,
} from '../../fast/FastVaultPasswordModal'
import { StartKeysignPromptProps } from './StartKeysignPromptProps'

const FastSignButton = styled(Button)`
  flex: 1;
  min-width: 0;
`

const PairedButton = styled(Button)`
  flex: 0 0 132px;
`

export const FastVaultStartKeysignPrompt = (props: StartKeysignPromptProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const [showModal, setShowModal] = useState(false)

  const { onBeforeStart, isLoading, ...navigationProps } = props
  const keysignPayload =
    'keysignPayload' in navigationProps
      ? navigationProps.keysignPayload
      : undefined

  // Sign what the network accepts now, not what it accepted when this screen
  // mounted. `null` means the rebuild failed and the ceremony is abandoned.
  const resolvePayload = async () =>
    onBeforeStart ? onBeforeStart() : shouldBePresent(keysignPayload)

  const executeNavigation = async (securityType: VaultSecurityType) => {
    if (securityType === 'fast') {
      setShowModal(true)
      return
    }

    const payload = await resolvePayload()
    if (!payload) {
      return
    }

    navigate({
      id: 'keysign',
      state: {
        ...navigationProps,
        keysignPayload: payload,
        securityType,
      },
    })
  }

  const onGetPassword = async ({ password }: FastVaultPasswordModalResult) => {
    // Rebuilt after the password prompt, not before it: entering a password is
    // exactly the kind of pause that lets a payload go stale.
    const payload = await resolvePayload()
    if (!payload) {
      // Drop back to the verify screen, which is where the failure is shown.
      setShowModal(false)
      return
    }

    navigate({
      id: 'keysign',
      state: {
        ...navigationProps,
        keysignPayload: payload,
        securityType: 'fast',
        password,
      },
    })
  }

  const disabled = keysignPayload
    ? false
    : 'disabledMessage' in props
      ? props.disabledMessage
      : true

  return (
    <>
      <HStack gap={12} fullWidth>
        <PairedButton
          disabled={disabled}
          kind="secondary"
          icon={<DevicesIcon />}
          onClick={() => executeNavigation('secure')}
        >
          {t('paired')}
        </PairedButton>
        <FastSignButton
          disabled={disabled}
          loading={isLoading}
          onClick={() => executeNavigation('fast')}
        >
          {t('fast_sign')}
        </FastSignButton>
      </HStack>
      <FastVaultPasswordModal
        showModal={showModal}
        onBack={() => setShowModal(false)}
        onFinish={onGetPassword}
        description={t('fast_vault_password_start_keysign_description')}
        withPasswordCache
      />
    </>
  )
}
