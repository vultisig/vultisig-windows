import { zodResolver } from '@hookform/resolvers/zod'
import { OnBackProp, OnForwardProp } from '@lib/ui/props'
import type { TFunction } from 'i18next'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { z } from 'zod'

import { Button } from '../../../lib/ui/buttons/Button'
import { InfoIcon } from '../../../lib/ui/icons/InfoIcon'
import { PasswordInput } from '../../../lib/ui/inputs/PasswordInput'
import { VStack } from '../../../lib/ui/layout/Stack'
import { WarningBlock } from '../../../lib/ui/status/WarningBlock'
import { Text } from '../../../lib/ui/text'
import { getColor } from '../../../lib/ui/theme/getters'
import { PageContent } from '../../../ui/page/PageContent'
import { PageHeader } from '../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton'
import { KeygenEducationPrompt } from '../../keygen/shared/KeygenEducationPrompt'
import { useVaultPassword } from './state/password'

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
  onForward,
  onBack,
}: OnForwardProp & Partial<OnBackProp>) => {
  const { t } = useTranslation()
  const [storedPassword, setStoredPassword] = useVaultPassword()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<PasswordSchema>({
    resolver: zodResolver(getPasswordSchema(t)),
    mode: 'all',
    defaultValues: {
      password: storedPassword || '',
      confirmPassword: '',
    },
  })

  const onSubmit = (data: PasswordSchema) => {
    setStoredPassword(data.password)
    onForward()
  }

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        secondaryControls={<KeygenEducationPrompt />}
      />
      <PageContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <VStack flexGrow gap={16}>
          <VStack gap={8}>
            <Text variant="h1Regular">{t('vultiserver_password')}</Text>
            <PasswordWarningBlock
              iconTooltipContent={
                <TooltipWrapper>
                  <Text color="reversed" size={16}>
                    {t('moreInfo')}
                  </Text>
                  <Text size={13} color="shy">
                    {t('secureVaultSetupPasswordTooltipContent')}
                  </Text>
                </TooltipWrapper>
              }
              icon={() => (
                <IconWrapper>
                  <InfoIcon />
                </IconWrapper>
              )}
            >
              {t('fastVaultSetup.passwordCannotBeRecovered')}
            </PasswordWarningBlock>
          </VStack>
          <VStack gap={8}>
            <VStack gap={4}>
              <PasswordInput
                {...register('password')}
                validation={
                  isValid ? 'valid' : errors.password ? 'invalid' : undefined
                }
                placeholder={t('enter_password')}
                onValueChange={value => setValue('password', value)}
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
                validation={
                  isValid
                    ? 'valid'
                    : errors.confirmPassword
                      ? 'invalid'
                      : undefined
                }
                placeholder={t('verify_password')}
                onValueChange={value => setValue('confirmPassword', value)}
              />
              {errors.confirmPassword && errors.confirmPassword.message && (
                <Text color="danger" size={12}>
                  {errors.confirmPassword.message}
                </Text>
              )}
            </VStack>
          </VStack>
        </VStack>
        <Button kind="primary" type="submit" isDisabled={!isValid}>
          {t('next')}
        </Button>
      </PageContent>
    </>
  )
}

const PasswordWarningBlock = styled(WarningBlock)`
  font-size: 13px;
  max-width: fit-content;
`

const IconWrapper = styled.div`
  font-size: 16px;
  color: ${getColor('idle')};
`

const TooltipWrapper = styled.div`
  background-color: ${getColor('white')};
  color: ${getColor('text')};
`
