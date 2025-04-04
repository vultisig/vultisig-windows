import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { EyeIcon } from '@lib/ui/icons/EyeIcon'
import InfoGradientIcon from '@lib/ui/icons/InfoGradientIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useMemo, useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { FlowPageHeader } from '../../../../ui/flow/FlowPageHeader'
import { PageSlice } from '../../../../ui/page/PageSlice'
import { useBackupVaultMutation } from '../../../mutations/useBackupVaultMutation'
import {
  createVaultBackupSchema,
  VaultBackupSchema,
} from './schemas/vaultBackupSchema'
import {
  ActionsWrapper,
  IconButton,
  InfoPill,
  InputField,
  InputFieldWrapper,
} from './VaultBackupPage.styles'

export const VaultBackupWithPassword = ({
  onFinish,
  onBack,
}: OnFinishProp & OnBackProp) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isVerifiedPasswordVisible, setIsVerifiedPasswordVisible] =
    useState(false)

  const { t } = useTranslation()
  const {
    mutate: backupVault,
    isPending,
    error,
  } = useBackupVaultMutation({
    onSuccess: onFinish,
  })

  const vaultBackupSchema = useMemo(() => createVaultBackupSchema(t), [t])

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<VaultBackupSchema>({
    resolver: zodResolver(vaultBackupSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data?: FieldValues) => {
    backupVault({ password: data?.password })
  }

  return (
    <VStack flexGrow gap={16}>
      <FlowPageHeader onBack={onBack} title={t('backup')} />
      <PageSlice gap={16} flexGrow={true}>
        <Text size={16} color="contrast" weight="600">
          {t('vault_backup_page_password_protection')}
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
                <InputField
                  type={isPasswordVisible ? 'text' : 'password'}
                  placeholder={t(
                    'vault_backup_page_password_input_placeholder'
                  )}
                  {...register('password')}
                />

                <IconButton
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  <EyeIcon />
                </IconButton>
              </InputFieldWrapper>
              {errors.password?.message && (
                <Text size={12} color="danger">
                  {typeof errors.password.message === 'string' &&
                    errors.password.message}
                </Text>
              )}
            </div>
            <div>
              <InputFieldWrapper>
                <InputField
                  type={isVerifiedPasswordVisible ? 'text' : 'password'}
                  placeholder={t(
                    'vault_backup_page_verified_password_input_placeholder'
                  )}
                  {...register('verifiedPassword')}
                />

                <IconButton
                  onClick={() =>
                    setIsVerifiedPasswordVisible(!isVerifiedPasswordVisible)
                  }
                >
                  <EyeIcon />
                </IconButton>
              </InputFieldWrapper>
              {errors.verifiedPassword && (
                <Text size={12} color="danger">
                  {' '}
                  {typeof errors.verifiedPassword.message === 'string' &&
                    errors.verifiedPassword.message}
                </Text>
              )}
            </div>
          </VStack>
          <ActionsWrapper gap={16}>
            <InfoPill kind="outlined">
              <InfoGradientIcon />{' '}
              <Text color="contrast" size={13}>
                {t('vault_backup_page_password_info')}
              </Text>
            </InfoPill>
            <Button
              isDisabled={!isValid || !isDirty || isPending}
              type="submit"
            >
              {isPending
                ? t('vault_backup_page_submit_loading_button_text')
                : t('save')}
            </Button>
            {error && (
              <Text size={12} color="danger">
                {error?.message}
              </Text>
            )}
          </ActionsWrapper>
        </VStack>
      </PageSlice>
    </VStack>
  )
}
