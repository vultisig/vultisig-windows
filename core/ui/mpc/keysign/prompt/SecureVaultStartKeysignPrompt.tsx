import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Button } from '@lib/ui/buttons/Button'
import { useTranslation } from 'react-i18next'

import { StartKeysignPromptProps } from './StartKeysignPromptProps'

export const SecureVaultStartKeysignPrompt = ({
  isDisabled,
  ...coreViewState
}: StartKeysignPromptProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <Button
      disabled={isDisabled}
      onClick={() =>
        navigate({
          id: 'keysign',
          state: {
            securityType: 'secure',
            ...coreViewState,
          },
        })
      }
    >
      {t('sign_transaction')}
    </Button>
  )
}
