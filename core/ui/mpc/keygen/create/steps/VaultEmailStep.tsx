import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { ScreenLayout } from '@lib/ui/layout/ScreenLayout/ScreenLayout'
import { VStack } from '@lib/ui/layout/Stack'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { validateEmail } from '@lib/utils/validation/validateEmail'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { z } from 'zod'

type VaultEmailStepProps = OnFinishProp<string> & OnBackProp

export const VaultEmailStep = ({ onFinish, onBack }: VaultEmailStepProps) => {
  const { t } = useTranslation()

  const schema = z.object({
    email: z
      .string()
      .min(1, t('email_required'))
      .refine(val => !validateEmail(val), t('invalid_email')),
  })

  const {
    formState: { errors, isValid },
    watch,
    register,
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
        <VStack gap={8}>
          <Title as="h1" size={22} weight={500} color="contrast">
            {t('enter_your_email')}
          </Title>
          <Text color="shy" size={14}>
            {t('enter_your_email_description')}
          </Text>
        </VStack>
        <VStack gap={8}>
          <TextInput
            {...register('email')}
            type="email"
            placeholder={t('email_placeholder')}
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
