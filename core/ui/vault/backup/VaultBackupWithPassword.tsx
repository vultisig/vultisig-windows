import { useBackupVaultMutation } from '@core/ui/vault/mutations/useBackupVaultMutation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { EyeIcon } from '@lib/ui/icons/EyeIcon'
import InfoGradientIcon from '@lib/ui/icons/InfoGradientIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageSlice } from '@lib/ui/page/PageSlice'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { TFunction } from 'i18next'
import { useMemo, useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { z } from 'zod'

const InputFieldWrapper = styled.div`
  position: relative;
  background-color: ${getColor('foreground')};
  ${borderRadius.m};
`

const InputField = styled.input`
  padding: 12px;
  background-color: transparent;
  display: block;
  width: 100%;
  color: ${getColor('text')};

  &::placeholder {
    font-size: 13px;
    color: ${getColor('textShy')};
  }

  &:focus {
    outline: none;
  }
`

const IconButton = styled(UnstyledButton)`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
`

const ActionsWrapper = styled(VStack)`
  margin-bottom: 32px;
`

const InfoPill = styled(Button)`
  pointer-events: none;
  justify-content: flex-start;
  white-space: wrap;
  gap: 4px;
  height: 40px;
`

const createVaultBackupSchema = (t: TFunction) =>
  z
    .object({
      password: z
        .string()
        .min(3, t('vault_backup_page_password_error'))
        .max(30),
      verifiedPassword: z
        .string()
        .min(3, 'Set a strong password and save it.')
        .max(30),
    })
    .refine(data => data.password === data.verifiedPassword, {
      message: t('vault_backup_page_verified_password_error'),
      path: ['verifiedPassword'],
    })

type VaultBackupSchema = z.infer<ReturnType<typeof createVaultBackupSchema>>

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
              <Text as="span" color="contrast" size={13}>
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
