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
    const keysignPayload =
      'keysignPayload' in props ? props.keysignPayload : undefined

    if (!keysignPayload) {
      return {
        disabled: 'disabledMessage' in props ? props.disabledMessage : true,
      }
    }

    return {
      onClick: () => {
        navigate({
          id: 'keysign',
          state: {
            securityType: 'secure',
            ...props,
            keysignPayload,
          },
        })
      },
    }
  }, [navigate, props])

  return <Button {...buttonProps}>{t('sign_transaction')}</Button>
}
