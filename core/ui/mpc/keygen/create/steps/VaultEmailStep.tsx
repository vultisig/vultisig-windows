import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { ScreenLayout } from '@lib/ui/layout/ScreenLayout/ScreenLayout'
import { VStack } from '@lib/ui/layout/Stack'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { validateEmail } from '@lib/utils/validation/validateEmail'
import { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { z } from 'zod'

import { ClearableTextInput } from '../components/ClearableTextInput'
import { StepProgressIndicator } from './StepProgressIndicator'
import { vaultSetupSteps } from './vault-setup-steps'

type VaultEmailStepProps = OnFinishProp<string> &
  OnBackProp & {
    stepIndex?: number
    headerRight?: ReactNode
  }

export const VaultEmailStep = ({
  onFinish,
  onBack,
  stepIndex,
  headerRight,
}: VaultEmailStepProps) => {
  const { t } = useTranslation()

  const schema = z.object({
    email: z
      .string()
      .min(1, t('email_required'))
      .refine(val => {
        const error = validateEmail(val)
        return !error
      }, t('incorrect_email')),
  })

  const {
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<{ email: string }>({
    defaultValues: { email: '' },
    mode: 'all',
    resolver: zodResolver(schema),
  })

  const email = watch('email')

  const handleNext = () => {
    if (!isValid) return
    onFinish(email)
  }

  return (
    <ScreenLayout
      onBack={onBack}
      headerRight={headerRight}
      footer={
        <Button
          style={{ width: '100%' }}
          disabled={!isValid}
          onClick={handleNext}
        >
          {t('next')}
        </Button>
      }
    >
      <Content>
        {stepIndex !== undefined && (
          <StepProgressIndicator
            steps={vaultSetupSteps}
            currentStepIndex={stepIndex}
          />
        )}
        <VStack gap={8}>
          <Title as="h1" size={22} weight={500} color="contrast">
            {t('enter_your_email')}
          </Title>
          <Text color="shy" size={14}>
            {t('enter_your_email_description')}
          </Text>
        </VStack>
        <VStack gap={8}>
          <ClearableTextInput
            type="email"
            placeholder={t('email_placeholder')}
            value={email}
            onValueChange={v => setValue('email', v, { shouldValidate: true })}
            onClear={() => setValue('email', '', { shouldValidate: true })}
            validation={
              errors.email ? 'invalid' : isValid ? 'valid' : undefined
            }
            autoFocus
          />
          {errors.email?.message && (
            <Text color="danger" size={12}>
              {errors.email.message}
            </Text>
          )}
        </VStack>
      </Content>
    </ScreenLayout>
  )
}

const Content = styled(VStack)`
  flex: 1;
  gap: 24px;
  padding-top: 24px;
`

const Title = styled(Text)`
  letter-spacing: -0.36px;
  line-height: 24px;
`
