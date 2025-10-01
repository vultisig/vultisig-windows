import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { KeygenEducationPrompt } from '@core/ui/mpc/keygen/education/KeygenEducationPrompt'
import { passwordLenghtConfig } from '@core/ui/security/password/config'
import { usePassword } from '@core/ui/state/password'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { CircleInfoIcon } from '@lib/ui/icons/CircleInfoIcon'
import { PasswordInput } from '@lib/ui/inputs/PasswordInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { WarningBlock } from '@lib/ui/status/WarningBlock'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { TFunction } from 'i18next'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { z } from 'zod'

const StyledTooltip = styled.div`
  background-color: ${getColor('white')};
  color: ${getColor('text')};
`

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

export const SetServerPasswordStep = ({
  onFinish,
  onBack,
}: OnFinishProp<{ password: string }> & Partial<OnBackProp>) => {
  const { t } = useTranslation()
  const [storedPassword = '', setStoredPassword] = usePassword()

  const schema = useMemo(() => createSchema(t), [t])

  const {
    formState: { errors, isValid },
    handleSubmit,
    register,
  } = useForm<Schema>({
    defaultValues: { password: storedPassword, confirmPassword: '' },
    mode: 'all',
    resolver: zodResolver(schema),
  })

  const onSubmit = ({ password }: Schema) => {
    setStoredPassword(password)
    onFinish({ password })
  }

  return (
    <VStack as="form" onSubmit={handleSubmit(onSubmit)} fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        secondaryControls={<KeygenEducationPrompt />}
        title={t('backup_password')}
        hasBorder
      />
      <PageContent gap={8} flexGrow scrollable>
        <PasswordInput
          {...register('password')}
          error={errors.password?.message}
          placeholder={t('enter_password')}
          validation={
            isValid ? 'valid' : errors.password ? 'invalid' : undefined
          }
          autoFocus
        />
        <PasswordInput
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          placeholder={t('verify_password')}
          validation={
            isValid ? 'valid' : errors.confirmPassword ? 'invalid' : undefined
          }
        />
      </PageContent>
      <PageFooter gap={16}>
        <WarningBlock
          iconTooltipContent={
            <StyledTooltip>
              <Text color="reversed" size={16}>
                {t('moreInfo')}
              </Text>
              <Text size={13} color="shy">
                {t('secureVaultSetupPasswordTooltipContent')}
              </Text>
            </StyledTooltip>
          }
          icon={CircleInfoIcon}
        >
          {t('fastVaultSetup.passwordCannotBeRecovered')}
        </WarningBlock>
        <Button disabled={!isValid} type="submit">
          {t('next')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
