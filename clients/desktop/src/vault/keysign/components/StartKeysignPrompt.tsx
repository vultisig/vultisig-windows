import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVaultSecurityType } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/buttons/Button'
import { IsDisabledProp, ValueProp } from '@lib/ui/props'
import { match } from '@lib/utils/match'
import { useTranslation } from 'react-i18next'

type StartKeysignPromptProps = ValueProp<KeysignPayload> & IsDisabledProp

export const StartKeysignPrompt = ({
  value: keysignPayload,
  isDisabled,
}: StartKeysignPromptProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  const securityType = useCurrentVaultSecurityType()

  const text = match(securityType, {
    fast: () => t('fast_sign'),
    secure: () => t('start_transaction'),
  })

  return (
    <Button
      isDisabled={isDisabled}
      onClick={() => {
        navigate('keysign', {
          state: {
            keysignPayload: {
              keysign: keysignPayload,
            },
          },
        })
      }}
    >
      {text}
    </Button>
  )
}
