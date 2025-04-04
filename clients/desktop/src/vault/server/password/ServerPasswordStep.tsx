import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { OnForwardProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { getFormProps } from '../../../lib/ui/form/utils/getFormProps'
import { PasswordInput } from '../../../lib/ui/inputs/PasswordInput'
import { InfoBlock } from '../../../lib/ui/status/InfoBlock'
import { PageContent } from '../../../ui/page/PageContent'
import { PageHeader } from '../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle'
import { getVaultFromServer } from '../../fast/api/getVaultFromServer'
import { useCurrentVault } from '../../state/currentVault'
import { getStorageVaultId } from '../../utils/storageVault'
import { useVaultPassword } from './state/password'

export const ServerPasswordStep: React.FC<OnForwardProp> = ({ onForward }) => {
  const { t } = useTranslation()

  const [password, setPassword] = useVaultPassword()

  const vault = useCurrentVault()

  const { mutate, error, isPending } = useMutation({
    mutationFn: async () =>
      getVaultFromServer({
        vaultId: getStorageVaultId(vault),
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
