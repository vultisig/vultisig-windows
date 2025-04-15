import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useCurrentVaultSecurityType } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/buttons/Button'
import { IsDisabledProp, ValueProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate'

type StartKeysignPromptProps = ValueProp<KeysignPayload> & IsDisabledProp

export const StartKeysignPrompt = ({
  value: keysignPayload,
  isDisabled,
}: StartKeysignPromptProps) => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()

  const securityType = useCurrentVaultSecurityType()

  if (securityType === 'fast') {
    return (
      <Button
        onClick={() => {
          navigate('fastKeysign', {
            state: {
              keysignPayload: {
                keysign: keysignPayload,
              },
            },
          })
        }}
        isDisabled={isDisabled}
      >
        {t('fast_sign')}
      </Button>
    )
  }

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
      {t('start_transaction')}
    </Button>
  )
}
