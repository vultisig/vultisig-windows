import { SettingsCtaButton } from '@core/ui/settings/SettingsCtaButton'
import {
  settingsInputHeight,
  settingsOutlinedTextInput,
} from '@core/ui/settings/settingsField'
import { SettingsPageContent } from '@core/ui/settings/SettingsPageContent'
import { SettingsPageFooter } from '@core/ui/settings/SettingsPageFooter'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { useCore } from '@core/ui/state/core'
import { useVaults } from '@core/ui/storage/vaults'
import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { zodResolver } from '@hookform/resolvers/zod'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { IconButton, iconButtonSize } from '@lib/ui/buttons/IconButton'
import { CircleXmarkFilledIcon } from '@lib/ui/icons/CircleXmarkFilledIcon'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { TFunction } from 'i18next'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { z } from 'zod'

const fieldPadding = 16
const clearIconSize = 18

const NameInput = styled(TextInput)`
  ${settingsOutlinedTextInput};
  padding-right: ${fieldPadding + clearIconSize + 8}px;
`

const ClearButton = styled(IconButton)`
  color: ${getColor('settingsClearIcon')};
  font-size: ${clearIconSize}px;
`

type CreateSchemaInput = {
  t: TFunction
  existingNames: string[]
  currentName: string
}

const createSchema = ({ t, existingNames, currentName }: CreateSchemaInput) => {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, t('vault_rename_page_name_error'))
      .max(50, t('vault_rename_page_name_error'))
      .refine(
        name =>
          name.toLowerCase() === currentName.trim().toLowerCase() ||
          !existingNames.some(
            existingName =>
              existingName.trim().toLowerCase() === name.toLowerCase()
          ),
        { message: t('vault_name_already_exists') }
      ),
  })
}

type Schema = z.infer<ReturnType<typeof createSchema>>

/** Renames the current vault, rejecting names another vault already uses. */
export const VaultRenamePage = () => {
  const { t } = useTranslation()
  const { goBack } = useCore()
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
    mode: 'onTouched',
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
      <SettingsPageHeader title={t('rename_vault')} />
      <SettingsPageContent gap={12} flexGrow scrollable>
        <ActionInsideInteractiveElement
          render={() => (
            <NameInput {...register('name')} data-testid="rename-vault-input" />
          )}
          action={
            <ClearButton
              type="button"
              aria-label={t('clear')}
              onClick={() => setValue('name', '')}
            >
              <CircleXmarkFilledIcon />
            </ClearButton>
          }
          actionPlacerStyles={{
            bottom: (settingsInputHeight - iconButtonSize.md) / 2,
            right: fieldPadding - (iconButtonSize.md - clearIconSize) / 2,
          }}
        />
        {typeof errors.name?.message === 'string' && (
          <Text color="danger" size={12} data-testid="rename-validation-error">
            {errors.name.message}
          </Text>
        )}
        {updateVaultMutation.error && (
          <Text color="danger" size={12}>
            {updateVaultMutation.error.message}
          </Text>
        )}
      </SettingsPageContent>
      <SettingsPageFooter>
        <SettingsCtaButton
          disabled={!isValid || !isDirty}
          loading={updateVaultMutation.isPending}
          type="submit"
          data-testid="rename-vault-save"
        >
          {t('save')}
        </SettingsCtaButton>
      </SettingsPageFooter>
    </VStack>
  )
}
