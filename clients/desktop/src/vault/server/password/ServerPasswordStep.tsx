import { useVaultPassword } from '@core/ui/state/password'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { OnForwardProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { PasswordInput } from '../../../lib/ui/inputs/PasswordInput'
import { InfoBlock } from '../../../lib/ui/status/InfoBlock'
import { getVaultFromServer } from '../../fast/api/getVaultFromServer'

export const ServerPasswordStep: React.FC<OnForwardProp> = ({ onForward }) => {
  const { t } = useTranslation()

  const [password, setPassword] = useVaultPassword()

  const vault = useCurrentVault()

  const { mutate, error, isPending } = useMutation({
    mutationFn: async () =>
      getVaultFromServer({
        vaultId: getVaultId(vault),
        password,
      }),
    onSuccess: onForward,
  })

  const isDisabled = useMemo(() => {
    if (!password) {
      return t('password_required')
    }
  }, [password, t])

  return (
    <>
      <PageHeader
        title={<PageHeaderTitle>{t('password')}</PageHeaderTitle>}
        primaryControls={<PageHeaderBackButton />}
      />
      <PageContent
        as="form"
        {...getFormProps({
          onSubmit: mutate,
          isDisabled,
        })}
      >
        <VStack gap={20} flexGrow>
          <PasswordInput
            placeholder={t('enter_password')}
            value={password}
            onValueChange={setPassword}
            label={t('fast_vault_password')}
          />
        </VStack>
        <VStack gap={20}>
          <InfoBlock>{t('password_to_decrypt')}</InfoBlock>
          <Button isLoading={isPending} type="submit">
            {t('continue')}
          </Button>
          {error && <Text color="danger">{t('incorrect_password')}</Text>}
        </VStack>
      </PageContent>
    </>
  )
}
