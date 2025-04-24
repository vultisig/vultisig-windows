import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVaultSecurityType } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { IsDisabledProp, ValueProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

type StartKeysignPromptProps = ValueProp<KeysignMessagePayload> & IsDisabledProp

export const StartKeysignPrompt = ({
  value: keysignPayload,
  isDisabled,
}: StartKeysignPromptProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  const securityType = useCurrentVaultSecurityType()

  return (
    <VStack gap={20}>
      <Button
        isDisabled={isDisabled}
        onClick={() => {
          navigate('keysign', {
            state: {
              securityType: 'secure',
              keysignPayload,
            },
          })
        }}
      >
        {t('sign')}
      </Button>
      {securityType === 'fast' && (
        <Button
          kind="outlined"
          isDisabled={isDisabled}
          onClick={() => {
            navigate('keysign', {
              state: {
                securityType: 'fast',
                keysignPayload,
              },
            })
          }}
        >
          {t('fast_sign')}
        </Button>
      )}
    </VStack>
  )
}
