import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Button } from '@lib/ui/buttons/Button'
import { useMutation } from '@tanstack/react-query'
import { KeysignMessagePayload } from '@vultisig/core-mpc/keysign/keysignPayload/KeysignMessagePayload'
import { useTranslation } from 'react-i18next'

import { StartKeysignPromptProps } from './StartKeysignPromptProps'

/** The start-keysign button for a secure vault, which signs with paired devices. */
export const SecureVaultStartKeysignPrompt = (
  props: StartKeysignPromptProps
) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  const { onBeforeStart, isLoading, ...navigationProps } = props
  const keysignPayload =
    'keysignPayload' in navigationProps
      ? navigationProps.keysignPayload
      : undefined

  // Spans the payload rebuild, a network round-trip, so the button shows the
  // click registered and ignores repeats until the keysign screen opens.
  const { mutate: start, isPending } = useMutation({
    mutationFn: async (currentPayload: KeysignMessagePayload) => {
      // Sign what the network accepts now, not what it accepted when this
      // screen mounted. A failed rebuild abandons the ceremony.
      const payload = onBeforeStart ? await onBeforeStart() : currentPayload
      if (!payload) {
        return
      }

      navigate({
        id: 'keysign',
        state: {
          securityType: 'secure',
          ...navigationProps,
          keysignPayload: payload,
        },
      })
    },
  })

  if (!keysignPayload) {
    return (
      <Button
        disabled={'disabledMessage' in props ? props.disabledMessage : true}
        loading={isLoading}
      >
        {t('sign_transaction')}
      </Button>
    )
  }

  return (
    <Button
      disabled={isPending}
      loading={isPending}
      onClick={() => start(keysignPayload)}
    >
      {t('sign_transaction')}
    </Button>
  )
}
