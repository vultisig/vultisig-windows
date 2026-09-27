import { Button } from '@lib/ui/buttons/Button'
import { DevicesIcon } from '@lib/ui/icons/DevicesIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { useMutation } from '@tanstack/react-query'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
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

/**
 * The start-keysign buttons for a fast vault: Fast Sign co-signs with the
 * server after a password prompt, Paired signs with the user's other devices.
 */
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

  // Spans the payload rebuild, a network round-trip, so Paired shows the click
  // registered and both buttons ignore input until the keysign screen opens.
  const { mutate: startPaired, isPending: isPairedStarting } = useMutation({
    mutationFn: async () => {
      const payload = await resolvePayload()
      if (!payload) {
        return
      }

      navigate({
        id: 'keysign',
        state: {
          ...navigationProps,
          keysignPayload: payload,
          securityType: 'secure',
        },
      })
    },
  })

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
    ? isPairedStarting
    : 'disabledMessage' in props
      ? props.disabledMessage
      : true

  return (
    <>
      <HStack gap={12} fullWidth>
        <PairedButton
          disabled={disabled}
          kind="secondary"
          loading={isPairedStarting}
          icon={<DevicesIcon />}
          onClick={() => startPaired()}
        >
          {t('paired')}
        </PairedButton>
        <FastSignButton
          disabled={disabled}
          loading={isLoading}
          onClick={() => setShowModal(true)}
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
