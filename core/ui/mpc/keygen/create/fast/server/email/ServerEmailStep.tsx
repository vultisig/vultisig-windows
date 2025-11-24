import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useEmail } from '@core/ui/state/email'
import { zodResolver } from '@hookform/resolvers/zod'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton, iconButtonSize } from '@lib/ui/buttons/IconButton'
import {
  textInputHeight,
  textInputHorizontalPadding,
} from '@lib/ui/css/textInput'
import { CircleCrossIcon } from '@lib/ui/icons/CircleCrossIcon'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { validateEmail } from '@lib/utils/validation/validateEmail'
import { TFunction } from 'i18next'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

const getEmailSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .min(1, { message: t('email_required') })
      .refine(val => !validateEmail(val), {
        message: t('invalid_email'),
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
    defaultValues: { email: storedEmail || '' },
    mode: 'all',
    resolver: zodResolver(getEmailSchema(t)),
  })

  const onSubmit = (data: EmailSchema) => {
    setStoredEmail(data.email)
    onFinish()
  }

  return (
    <VStack as="form" onSubmit={handleSubmit(onSubmit)} fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={t('fastVaultSetup.enterEmail')}
        hasBorder
      />
      <PageContent gap={8} flexGrow scrollable>
        <Text size={14} color="shy">
          {t('fastVaultSetup.emailSetupTitle')}
        </Text>
        <VStack gap={4}>
          <ActionInsideInteractiveElement
            render={() => (
              <TextInput
                {...register('email')}
                onValueChange={value => setValue('email', value)}
                placeholder={t('email')}
                validation={
                  isValid ? 'valid' : errors.email ? 'invalid' : undefined
                }
                autoFocus
              />
            )}
            action={
              <IconButton onClick={() => setValue('email', '')}>
                <CircleCrossIcon />
              </IconButton>
            }
            actionPlacerStyles={{
              bottom: (textInputHeight - iconButtonSize.md) / 2,
              right: textInputHorizontalPadding,
            }}
          />
          {errors.email && errors.email.message && (
            <Text color="danger" size={12}>
              {errors.email.message}
            </Text>
          )}
        </VStack>
      </PageContent>
      <PageFooter>
        <Button disabled={errors.email?.message} type="submit">
          {t('next')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
