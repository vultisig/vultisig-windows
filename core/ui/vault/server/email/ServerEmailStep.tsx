import { useEmail } from '@core/ui/state/email'
import { zodResolver } from '@hookform/resolvers/zod'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { Button } from '@lib/ui/buttons/Button'
import { iconButtonIconSizeRecord } from '@lib/ui/buttons/IconButton'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import {
  textInputHeight,
  textInputHorizontalPadding,
} from '@lib/ui/css/textInput'
import { CircledCloseIcon } from '@lib/ui/icons/CircledCloseIcon'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { validateEmail } from '@lib/utils/validation/validateEmail'
import type { TFunction } from 'i18next'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

const getEmailSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .min(1, { message: t('fastVaultSetup.emailRequired') })
      .refine(val => !validateEmail(val), {
        message: t('fastVaultSetup.emailIncorrect'),
      }),
  })

type EmailSchema = z.infer<ReturnType<typeof getEmailSchema>>

export const ServerEmailStep = ({
  onFinish,
  onBack,
}: OnFinishProp & Partial<OnBackProp>) => {
  const { t } = useTranslation()
  const [storedEmail, setStoredEmail] = useEmail()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<EmailSchema>({
    resolver: zodResolver(getEmailSchema(t)),
    defaultValues: {
      email: storedEmail || '',
    },
    mode: 'all',
  })

  const onSubmit = (data: EmailSchema) => {
    setStoredEmail(data.email)
    onFinish()
  }

  return (
    <>
      <PageHeader primaryControls={<PageHeaderBackButton onClick={onBack} />} />
      <PageContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <VStack flexGrow gap={16}>
          <VStack>
            <Text variant="h1Regular">{t('fastVaultSetup.enterEmail')}</Text>
            <Text size={14} color="shy">
              {t('fastVaultSetup.emailSetupTitle')}
            </Text>
          </VStack>
          <VStack gap={4}>
            <ActionInsideInteractiveElement
              render={() => (
                <TextInput
                  {...register('email')}
                  validation={
                    isValid ? 'valid' : errors.email ? 'invalid' : undefined
                  }
                  placeholder={t('email')}
                  autoFocus
                  onValueChange={value => setValue('email', value)}
                />
              )}
              action={
                <UnstyledButton onClick={() => setValue('email', '')}>
                  <CircledCloseIcon />
                </UnstyledButton>
              }
              actionPlacerStyles={{
                right: textInputHorizontalPadding,
                bottom: (textInputHeight - iconButtonIconSizeRecord.l) / 2,
              }}
            />

            {errors.email && errors.email.message && (
              <Text color="danger" size={12}>
                {errors.email.message}
              </Text>
            )}
          </VStack>
        </VStack>
        <VStack gap={20}>
          <Button type="submit" isDisabled={!!errors.email}>
            {t('next')}
          </Button>
        </VStack>
      </PageContent>
    </>
  )
}
