import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVaultSecurityType } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { IsDisabledProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { CoreViewState } from '../../navigation/CoreView'

type StartKeysignPromptProps = Omit<CoreViewState<'keysign'>, 'securityType'> &
  IsDisabledProp

export const StartKeysignPrompt = ({
  isDisabled,
  ...coreViewState
}: StartKeysignPromptProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  const securityType = useCurrentVaultSecurityType()

  return (
    <VStack gap={20}>
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
      {securityType === 'fast' && (
        <Button
          disabled={isDisabled}
          onClick={() =>
            navigate({
              id: 'keysign',
              state: {
                securityType: 'fast',
                ...coreViewState,
              },
            })
          }
        >
          {t('fast_sign')}
        </Button>
      )}
    </VStack>
  )
}
