import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { zodResolver } from '@hookform/resolvers/zod'
import { VStack } from '@lib/ui/layout/Stack'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { PageSlice } from '@lib/ui/page/PageSlice'
import { Text } from '@lib/ui/text'
import { useEffect, useMemo } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import {
  ButtonWithBottomSpace,
  InputField,
  InputFieldWrapper,
} from './VaultRenamePage.styles'

const VaultRenamePage = () => {
  const { t } = useTranslation()
  const goBack = useNavigateBack()
  const vault = useCurrentVault()
  const renameSchema = useMemo(
    () =>
      z.object({
        vaultName: z.string().min(2, t('vault_rename_page_name_error')).max(50),
      }),
    [t]
  )
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(renameSchema),
    mode: 'onBlur',
    defaultValues: {
      vaultName: vault.name,
    },
  })

  const {
    mutate: updateVault,
    isPending,
    error,
    isSuccess,
  } = useUpdateVaultMutation()

  const onSubmit = (data: FieldValues) => {
    updateVault({
      vaultId: getVaultId(vault),
      fields: { name: data.vaultName },
    })
  }

  useEffect(() => {
    if (isSuccess) {
      goBack()
    }
  }, [isSuccess, goBack])

  return (
    <VStack flexGrow gap={16}>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={
          <PageHeaderTitle>
            {t('vault_rename_page_header_title')}
          </PageHeaderTitle>
        }
      />
      <PageSlice gap={16} flexGrow={true}>
        <Text size={16} color="contrast" weight="600">
          {t('vault_name')}
        </Text>
        <VStack
          flexGrow={true}
          justifyContent="space-between"
          as="form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <VStack gap={12}>
            <div>
              <InputFieldWrapper>
                <InputField type="text" {...register('vaultName')} />
              </InputFieldWrapper>
              {errors.vaultName?.message && (
                <Text size={12} color="danger">
                  {typeof errors.vaultName.message === 'string' &&
                    errors.vaultName.message}
                </Text>
              )}
            </div>
          </VStack>
          <ButtonWithBottomSpace
            isLoading={isPending}
            isDisabled={!isValid || !isDirty}
            type="submit"
          >
            {t('save')}
          </ButtonWithBottomSpace>
          {error && (
            <Text size={12} color="danger">
              {error?.message}
            </Text>
          )}
        </VStack>
      </PageSlice>
    </VStack>
  )
}

export default VaultRenamePage
