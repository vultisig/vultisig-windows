import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { useBackupVaultMutation } from '@core/ui/vault/mutations/useBackupVaultMutation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { PasswordInput } from '@lib/ui/inputs/PasswordInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { InfoBlock } from '@lib/ui/status/InfoBlock'
import { Text } from '@lib/ui/text'
import { TFunction } from 'i18next'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { passwordLenghtConfig } from '../../security/password/config'

const createSchema = (t: TFunction) => {
  const message = t('password_pattern_error', passwordLenghtConfig)

  return z
    .object({
      password: z
        .string()
        .min(passwordLenghtConfig.min, message)
        .max(passwordLenghtConfig.max, message),
      confirmPassword: z.string(),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('password_do_not_match'),
      path: ['confirmPassword'],
    })
}

type Schema = z.infer<ReturnType<typeof createSchema>>

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
    mode: 'onBlur',
    resolver: zodResolver(schema),
  })

  const onSubmit = ({ password }: Schema) => {
    mutate({ password })
  }

  return (
    <VStack as="form" onSubmit={handleSubmit(onSubmit)} fullHeight>
      <FlowPageHeader title={t('backup')} onBack={onBack} />
      <PageContent gap={16} flexGrow scrollable>
        <Text size={16} weight="600">
          {t('vault_backup_page_password_protection')}
        </Text>
        <VStack gap={8}>
          <PasswordInput
            {...register('password')}
            error={errors.password?.message}
            placeholder={t('enter_password')}
            validation={
              isValid ? 'valid' : errors.password ? 'invalid' : undefined
            }
          />
          <PasswordInput
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
            placeholder={t('verify_password')}
            validation={
              isValid ? 'valid' : errors.confirmPassword ? 'invalid' : undefined
            }
          />
        </VStack>
      </PageContent>
      <PageFooter gap={16}>
        <InfoBlock>{t('vault_backup_page_password_info')}</InfoBlock>
        <Button disabled={!isValid} loading={isPending} type="submit">
          {isPending
            ? t('vault_backup_page_submit_loading_button_text')
            : t('save')}
        </Button>
        {error?.message && (
          <Text color="danger" size={12}>
            {error.message}
          </Text>
        )}
      </PageFooter>
    </VStack>
  )
}
