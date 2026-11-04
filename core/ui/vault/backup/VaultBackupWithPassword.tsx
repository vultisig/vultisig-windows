import { SettingsCtaButton } from '@core/ui/settings/SettingsCtaButton'
import {
  settingsFieldValidation,
  settingsInputHeight,
  settingsOutlinedTextInput,
} from '@core/ui/settings/settingsField'
import { SettingsPageContent } from '@core/ui/settings/SettingsPageContent'
import { SettingsPageFooter } from '@core/ui/settings/SettingsPageFooter'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { useBackupVaultMutation } from '@core/ui/vault/mutations/useBackupVaultMutation'
import { zodResolver } from '@hookform/resolvers/zod'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { PasswordInput } from '@lib/ui/inputs/PasswordInput'
import { VStack } from '@lib/ui/layout/Stack'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { WarningBlock } from '@lib/ui/status/WarningBlock'
import { Text } from '@lib/ui/text'
import { passwordLengthConfig } from '@vultisig/core-config/password'
import { TFunction } from 'i18next'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { z } from 'zod'

const Field = styled(PasswordInput)`
  ${settingsOutlinedTextInput};
  ${settingsFieldValidation};
`

const Warning = styled(WarningBlock)`
  ${borderRadius.xl};
`

const createSchema = (t: TFunction) => {
  const message = t('password_pattern_error', passwordLengthConfig)

  return z
    .object({
      password: z
        .string()
        .min(passwordLengthConfig.min, message)
        .max(passwordLengthConfig.max, message),
      confirmPassword: z.string(),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('password_do_not_match'),
      path: ['confirmPassword'],
    })
}

type Schema = z.infer<ReturnType<typeof createSchema>>

/** Saves the backup encrypted with a password the user chooses and confirms. */
export const VaultBackupWithPassword = ({
  onFinish,
  onBack,
  vaultIds,
}: OnFinishProp & OnBackProp & { vaultIds: string[] }) => {
  const { t } = useTranslation()

  const schema = useMemo(() => createSchema(t), [t])

  const { error, isPending, mutate } = useBackupVaultMutation({
    onSuccess: onFinish,
    vaultIds,
  })

  const {
    formState: { errors, isValid },
    handleSubmit,
    register,
  } = useForm<Schema>({
    mode: 'onTouched',
    resolver: zodResolver(schema),
  })

  const onSubmit = ({ password }: Schema) => {
    mutate({ password })
  }

  return (
    <VStack as="form" onSubmit={handleSubmit(onSubmit)} fullHeight>
      <SettingsPageHeader title={null} onBack={onBack} />
      <SettingsPageContent gap={24} flexGrow scrollable>
        <Text color="regular" variant="stationTitle1">
          {t('vault_backup_page_password_protection')}
        </Text>
        <Warning>{t('vault_backup_page_password_info')}</Warning>
        <VStack gap={8}>
          <Field
            {...register('password')}
            error={errors.password?.message}
            inputHeight={settingsInputHeight}
            placeholder={t('enter_password')}
            validation={
              isValid ? 'valid' : errors.password ? 'invalid' : undefined
            }
          />
          <Field
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
            inputHeight={settingsInputHeight}
            placeholder={t('reenter_password')}
            validation={
              isValid ? 'valid' : errors.confirmPassword ? 'invalid' : undefined
            }
          />
        </VStack>
      </SettingsPageContent>
      <SettingsPageFooter gap={16}>
        <SettingsCtaButton
          disabled={!isValid || isPending}
          loading={isPending}
          type="submit"
        >
          {isPending
            ? t('vault_backup_page_submit_loading_button_text')
            : t('save')}
        </SettingsCtaButton>
        {error?.message && (
          <Text color="danger" size={12}>
            {error.message}
          </Text>
        )}
      </SettingsPageFooter>
    </VStack>
  )
}
