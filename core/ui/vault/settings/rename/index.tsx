import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { useEffect, useMemo } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

export const VaultRenamePage = () => {
  const { t } = useTranslation()
  const navigateBack = useNavigateBack()
  const currentVault = useCurrentVault()
  const updateVaultMutation = useUpdateVaultMutation()
  const formSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t('vault_rename_page_name_error')).max(50),
      }),
    [t]
  )
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: {
      name: currentVault.name,
    },
  })

  const onSubmit = ({ name }: FieldValues) => {
    if (isValid && isDirty) {
      updateVaultMutation.mutate({
        vaultId: getVaultId(currentVault),
        fields: { name },
      })
    }
  }

  useEffect(() => {
    if (updateVaultMutation.isSuccess) navigateBack()
  }, [updateVaultMutation.isSuccess, navigateBack])

  return (
    <VStack as="form" gap={16} onSubmit={handleSubmit(onSubmit)} fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('rename_vault')}</PageHeaderTitle>}
        hasBorder
      />
      <PageContent gap={12} flexGrow scrollable>
        <TextInput {...register('name')} />
        {typeof errors.name?.message === 'string' && (
          <Text color="danger" size={12}>
            {errors.name.message}
          </Text>
        )}
        {updateVaultMutation.error && (
          <Text color="danger" size={12}>
            {updateVaultMutation.error.message}
          </Text>
        )}
      </PageContent>
      <PageFooter>
        <Button
          isDisabled={!isValid || !isDirty}
          isLoading={updateVaultMutation.isPending}
          type="submit"
        >
          {t('save')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
