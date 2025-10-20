import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCore } from '@core/ui/state/core'
import { useVaults } from '@core/ui/storage/vaults'
import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { zodResolver } from '@hookform/resolvers/zod'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton, iconButtonSize } from '@lib/ui/buttons/IconButton'
import {
  textInputHeight,
  textInputHorizontalPadding,
} from '@lib/ui/css/textInput'
import { CloseIcon } from '@lib/ui/icons/CloseIcon'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { TFunction } from 'i18next'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'
import { z } from 'zod'

type CreateSchemaInput = {
  t: TFunction
  existingNames: string[]
  currentName: string
}

const createSchema = ({ t, existingNames, currentName }: CreateSchemaInput) => {
  return z.object({
    name: z
      .string()
      .min(2, t('vault_rename_page_name_error'))
      .max(50, t('vault_rename_page_name_error'))
      .refine(
        name =>
          name === currentName ||
          !existingNames.some(
            existingName => existingName.toLowerCase() === name.toLowerCase()
          ),
        { message: t('vault_name_already_exists') }
      ),
  })
}

type Schema = z.infer<ReturnType<typeof createSchema>>

export const VaultRenamePage = () => {
  const { t } = useTranslation()
  const { goBack } = useCore()
  const { colors } = useTheme()
  const currentVault = useCurrentVault()
  const vaults = useVaults()
  const updateVaultMutation = useUpdateVaultMutation()

  const existingNames = useMemo(() => vaults.map(vault => vault.name), [vaults])

  const schema = useMemo(
    () => createSchema({ t, existingNames, currentName: currentVault.name }),
    [t, existingNames, currentVault.name]
  )
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<Schema>({
    defaultValues: { name: currentVault.name },
    mode: 'onBlur',
    resolver: zodResolver(schema),
  })

  const onSubmit = ({ name }: Schema) => {
    if (isDirty) {
      updateVaultMutation.mutate({
        vaultId: getVaultId(currentVault),
        fields: { name },
      })
    }
  }

  useEffect(() => {
    if (updateVaultMutation.isSuccess) goBack()
  }, [updateVaultMutation.isSuccess, goBack])

  return (
    <VStack as="form" onSubmit={handleSubmit(onSubmit)} fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('rename_vault')}
        hasBorder
      />
      <PageContent gap={12} flexGrow scrollable>
        <ActionInsideInteractiveElement
          render={() => <TextInput {...register('name')} />}
          action={
            <IconButton
              style={{
                color: colors.textShy.toCssValue(),
              }}
              onClick={() => setValue('name', '')}
            >
              <CloseIcon />
            </IconButton>
          }
          actionPlacerStyles={{
            bottom: (textInputHeight - iconButtonSize.md) / 2,
            right: textInputHorizontalPadding,
          }}
        />
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
          disabled={!isValid || !isDirty}
          loading={updateVaultMutation.isPending}
          type="submit"
        >
          {t('save')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
