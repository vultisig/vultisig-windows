import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Button } from '@lib/ui/buttons/Button'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { StartKeysignPromptProps } from './StartKeysignPromptProps'

export const SecureVaultStartKeysignPrompt = (
  props: StartKeysignPromptProps
) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  const buttonProps = useMemo(() => {
    const { onBeforeStart, isLoading, ...navigationProps } = props
    const keysignPayload =
      'keysignPayload' in navigationProps
        ? navigationProps.keysignPayload
        : undefined

    if (!keysignPayload) {
      return {
        disabled: 'disabledMessage' in props ? props.disabledMessage : true,
        loading: isLoading,
      }
    }

    return {
      onClick: async () => {
        // Sign what the network accepts now, not what it accepted when this
        // screen mounted. A failed rebuild abandons the ceremony.
        const payload = onBeforeStart ? await onBeforeStart() : keysignPayload
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
    }
  }, [navigate, props])

  return <Button {...buttonProps}>{t('sign_transaction')}</Button>
}
