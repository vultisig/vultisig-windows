import { KeygenEducationPrompt } from '@core/ui/mpc/keygen/education/KeygenEducationPrompt'
import { useVaultPassword } from '@core/ui/state/password'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { InfoIcon } from '@lib/ui/icons/InfoIcon'
import { PasswordInput } from '@lib/ui/inputs/PasswordInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { WarningBlock } from '@lib/ui/status/WarningBlock'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { TFunction } from 'i18next'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { z } from 'zod'

const StyledIcon = styled(InfoIcon)`
  color: ${getColor('idle')};
`

const StyledTooltip = styled(VStack)`
  background-color: ${getColor('white')};
  color: ${getColor('text')};
`

const getPasswordSchema = (t: TFunction) =>
  z
    .object({
      password: z.string().min(1, t('password_required')),
      confirmPassword: z
        .string()
        .min(1, t('fastVaultSetup.confirmPasswordIsRequired')),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('fastVaultSetup.passwordDoNotMatch'),
      path: ['confirmPassword'],
    })

type PasswordSchema = z.infer<ReturnType<typeof getPasswordSchema>>

export const SetServerPasswordStep = ({
  onFinish,
  onBack,
}: OnFinishProp & Partial<OnBackProp>) => {
  const { t } = useTranslation()
  const [storedPassword, setStoredPassword] = useVaultPassword()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<PasswordSchema>({
    defaultValues: { password: storedPassword || '', confirmPassword: '' },
    mode: 'all',
    resolver: zodResolver(getPasswordSchema(t)),
  })

  const onSubmit = (data: PasswordSchema) => {
    setStoredPassword(data.password)
    onFinish()
  }

  return (
    <VStack as="form" onSubmit={handleSubmit(onSubmit)} fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        secondaryControls={<KeygenEducationPrompt />}
        title={<PageHeaderTitle>{t('vultiserver_password')}</PageHeaderTitle>}
        hasBorder
      />
      <PageContent gap={16} flexGrow scrollable>
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
          icon={() => <StyledIcon />}
          style={{ width: 'fit-content' }}
        >
          {t('fastVaultSetup.passwordCannotBeRecovered')}
        </WarningBlock>
        <VStack gap={8}>
          <VStack gap={4}>
            <PasswordInput
              {...register('password')}
              onValueChange={value => setValue('password', value)}
              placeholder={t('enter_password')}
              validation={
                isValid ? 'valid' : errors.password ? 'invalid' : undefined
              }
              autoFocus
            />
            {errors.password && errors.password?.message && (
              <Text color="danger" size={12}>
                {errors.password.message}
              </Text>
            )}
          </VStack>
          <VStack gap={4}>
            <PasswordInput
              {...register('confirmPassword')}
              onValueChange={value => setValue('confirmPassword', value)}
              placeholder={t('verify_password')}
              validation={
                isValid
                  ? 'valid'
                  : errors.confirmPassword
                    ? 'invalid'
                    : undefined
              }
            />
            {errors.confirmPassword && errors.confirmPassword.message && (
              <Text color="danger" size={12}>
                {errors.confirmPassword.message}
              </Text>
            )}
          </VStack>
        </VStack>
      </PageContent>
      <PageFooter>
        <Button disabled={!isValid} type="submit">
          {t('next')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
