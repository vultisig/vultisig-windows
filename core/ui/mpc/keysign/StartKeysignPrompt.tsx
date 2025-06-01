import { CoreView } from '@core/ui/navigation/CoreView'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVaultSecurityType } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/button'
import { VStack } from '@lib/ui/layout/Stack'
import { IsDisabledProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

type StartKeysignPromptProps = Omit<
  Extract<CoreView, { id: 'keysign' }>['state'],
  'securityType'
> &
  IsDisabledProp

export const StartKeysignPrompt = ({
  keysignPayload,
  isDisabled,
  isDAppSigning,
}: StartKeysignPromptProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  const securityType = useCurrentVaultSecurityType()

  return (
    <VStack gap={20}>
      <Button
        disabled={!!isDisabled}
        label={t('sign_transaction')}
        onClick={() =>
          navigate({
            id: 'keysign',
            state: {
              securityType: 'secure',
              keysignPayload,
              isDAppSigning,
            },
          })
        }
      />
      {securityType === 'fast' && (
        <Button
          disabled={!!isDisabled}
          label={t('fast_sign')}
          onClick={() =>
            navigate({
              id: 'keysign',
              state: {
                securityType: 'fast',
                keysignPayload,
                isDAppSigning,
              },
            })
          }
        />
      )}
    </VStack>
  )
}
