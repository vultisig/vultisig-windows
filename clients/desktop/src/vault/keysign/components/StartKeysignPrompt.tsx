import { hasServer, isServer } from '@core/mpc/devices/localPartyId'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
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
  const { signers, localPartyId } = useCurrentVault()

  if (hasServer(signers) && !isServer(localPartyId)) {
    return (
      <VStack gap={20}>
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
        <Button
          kind="outlined"
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
          {t('paired_sign')}
        </Button>
      </VStack>
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
