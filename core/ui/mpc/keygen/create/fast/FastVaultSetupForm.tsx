import { passwordLengthConfig } from '@core/config/password'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { usePasswordHint } from '@core/ui/mpc/keygen/create/fast/server/password-hint/state/password-hint'
import { useVaultName } from '@core/ui/mpc/keygen/create/state/vaultName'
import { KeygenEducationPrompt } from '@core/ui/mpc/keygen/education/KeygenEducationPrompt'
import { useEmail } from '@core/ui/state/email'
import { usePassword } from '@core/ui/state/password'
import { useVaultNames } from '@core/ui/storage/vaults'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { validateEmail } from '@lib/utils/validation/validateEmail'
import { TFunction } from 'i18next'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { EmailFormSection } from '../components/EmailFormSection'
import { NameFormSection } from '../components/NameFormSection'
import { PasswordFormSection } from '../components/PasswordFormSection'
import { getVaultNameSchema } from '../utils/getVaultNameSchema'

type FastVaultSetupFormProps = OnFinishProp & Partial<OnBackProp>

const getFastVaultSchema = (t: TFunction, existingVaultNames: string[]) => {
  const passwordMessage = t('password_pattern_error', passwordLengthConfig)

  return z
    .object({
      name: getVaultNameSchema(t, existingVaultNames),
      email: z
        .string()
        .min(1, t('email_required'))
        .refine(val => !validateEmail(val), t('invalid_email')),
      password: z
        .string()
        .min(passwordLengthConfig.min, passwordMessage)
        .max(passwordLengthConfig.max, passwordMessage),
      confirmPassword: z.string(),
      hint: z.string().optional(),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('password_do_not_match'),
      path: ['confirmPassword'],
    })
}

type FastVaultFormValues = z.infer<ReturnType<typeof getFastVaultSchema>>

export const FastVaultSetupForm = ({
  onFinish,
  onBack,
}: FastVaultSetupFormProps) => {
  const { t } = useTranslation()
  const existingVaultNames = useVaultNames()

  const [storedName, setStoredName] = useVaultName()
  const [storedEmail, setStoredEmail] = useEmail()
  const [storedPassword, setStoredPassword] = usePassword()
  const [storedHint, setStoredHint] = usePasswordHint()

  const [expandedSection, setExpandedSection] = useState<
    'name' | 'email' | 'password'
  >('name')

  const schema = useMemo(
    () => getFastVaultSchema(t, existingVaultNames),
    [t, existingVaultNames]
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
    trigger,
  } = useForm<FastVaultFormValues>({
    defaultValues: {
      name: storedName,
      email: storedEmail || '',
      password: storedPassword || '',
      confirmPassword: '',
      hint: storedHint || '',
    },
    mode: 'all',
    resolver: zodResolver(schema),
  })

  const values = watch()

  const onSubmit = (data: FastVaultFormValues) => {
    setStoredName(data.name)
    setStoredEmail(data.email)
    setStoredPassword(data.password)
    setStoredHint(data.hint || '')
    onFinish()
  }

  const handleNext = async () => {
    if (expandedSection === 'name') {
      if (await trigger('name')) {
        setExpandedSection('email')
      }
    } else if (expandedSection === 'email') {
      if (await trigger('email')) {
        setExpandedSection('password')
      }
    } else {
      handleSubmit(onSubmit)()
    }
  }

  useEffect(() => {
    if (errors.name) {
      setExpandedSection('name')
    } else if (errors.email) {
      setExpandedSection('email')
    } else if (errors.password || errors.confirmPassword) {
      setExpandedSection('password')
    }
  }, [errors])

  return (
    <VStack as="form" onSubmit={handleSubmit(onSubmit)} fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        secondaryControls={<KeygenEducationPrompt />}
        title={t('new_vault_setup')}
        hasBorder
      />
      <PageContent gap={12} flexGrow scrollable>
        <NameFormSection
          isExpanded={expandedSection === 'name'}
          onToggle={() => setExpandedSection('name')}
          register={register('name')}
          error={errors.name?.message}
          value={values.name}
          onValueChange={v => setValue('name', v, { shouldValidate: true })}
        />

        <EmailFormSection
          isExpanded={expandedSection === 'email'}
          onToggle={() => setExpandedSection('email')}
          register={register('email')}
          error={errors.email?.message}
          value={values.email}
          onValueChange={v => setValue('email', v, { shouldValidate: true })}
        />

        <PasswordFormSection
          isExpanded={expandedSection === 'password'}
          onToggle={() => setExpandedSection('password')}
          passwordRegister={register('password')}
          confirmPasswordRegister={register('confirmPassword')}
          hintRegister={register('hint')}
          passwordError={errors.password?.message}
          confirmPasswordError={errors.confirmPassword?.message}
          passwordValue={values.password}
          confirmPasswordValue={values.confirmPassword}
          hintValue={values.hint || ''}
          onPasswordChange={v =>
            setValue('password', v, { shouldValidate: true })
          }
          onConfirmPasswordChange={v =>
            setValue('confirmPassword', v, { shouldValidate: true })
          }
          onHintChange={v => setValue('hint', v, { shouldValidate: true })}
        />
      </PageContent>
      <PageFooter>
        <Button disabled={!isValid} type="button" onClick={handleNext}>
          {expandedSection === 'password' ? t('get_started') : t('next')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
