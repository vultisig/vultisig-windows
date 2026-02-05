import { passwordLengthConfig } from '@core/config/password'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { KeygenEducationPrompt } from '@core/ui/mpc/keygen/education/KeygenEducationPrompt'
import { useVaultNames } from '@core/ui/storage/vaults'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { validateEmail } from '@lib/utils/validation/validateEmail'
import { TFunction } from 'i18next'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { EmailFormSection } from './components/EmailFormSection'
import { NameFormSection } from './components/NameFormSection'
import { PasswordFormSection } from './components/PasswordFormSection'
import { useGeneratedVaultName } from './hooks/useGeneratedVaultName'
import { getVaultNameSchema } from './utils/getVaultNameSchema'
import {
  FastVaultCreationInput,
  SecureVaultCreationInput,
} from './VaultCreationInput'

type VaultSetupFormProps =
  | {
      vaultSecurityType: 'fast'
      onSubmit: (data: FastVaultCreationInput) => void
      onBack?: () => void
    }
  | {
      vaultSecurityType: 'secure'
      onSubmit: (data: SecureVaultCreationInput) => void
      onBack?: () => void
    }

const getVaultSetupSchema = (
  t: TFunction,
  existingVaultNames: string[],
  vaultSecurityType: 'fast' | 'secure'
) => {
  const baseSchema = z.object({
    name: getVaultNameSchema(t, existingVaultNames),
    referral: z.string().max(4).optional(),
  })

  if (vaultSecurityType === 'secure') {
    return baseSchema
  }

  const passwordMessage = t('password_pattern_error', passwordLengthConfig)

  return baseSchema
    .extend({
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

type FormValues = {
  name: string
  referral?: string
  email?: string
  password?: string
  confirmPassword?: string
  hint?: string
}

export const VaultSetupForm = (props: VaultSetupFormProps) => {
  const { onSubmit, onBack, vaultSecurityType } = props
  const { t } = useTranslation()
  const existingVaultNames = useVaultNames()

  const generatedName = useGeneratedVaultName()

  const isFast = vaultSecurityType === 'fast'

  const [expandedSection, setExpandedSection] = useState<
    'name' | 'email' | 'password'
  >('name')

  const schema = useMemo(
    () => getVaultSetupSchema(t, existingVaultNames, vaultSecurityType),
    [t, existingVaultNames, vaultSecurityType]
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
    trigger,
  } = useForm<FormValues>({
    defaultValues: {
      name: generatedName,
      referral: '',
      ...(isFast && {
        email: '',
        password: '',
        confirmPassword: '',
        hint: '',
      }),
    },
    mode: 'all',
    resolver: zodResolver(schema),
  })

  const values = watch()

  const handleFormSubmit = (data: FormValues) => {
    if (isFast) {
      ;(onSubmit as (data: FastVaultCreationInput) => void)({
        name: data.name,
        email: data.email!,
        password: data.password!,
        hint: data.hint,
        referral: data.referral,
      })
    } else {
      ;(onSubmit as (data: SecureVaultCreationInput) => void)({
        name: data.name,
        referral: data.referral,
      })
    }
  }

  const handleNext = async () => {
    if (!isFast) {
      handleSubmit(handleFormSubmit)()
      return
    }

    if (expandedSection === 'name') {
      if (await trigger('name')) {
        setExpandedSection('email')
      }
    } else if (expandedSection === 'email') {
      if (await trigger('email')) {
        setExpandedSection('password')
      }
    } else {
      handleSubmit(handleFormSubmit)()
    }
  }

  useEffect(() => {
    if (!isFast) return

    if (errors.name) {
      setExpandedSection('name')
    } else if (errors.email) {
      setExpandedSection('email')
    } else if (errors.password || errors.confirmPassword) {
      setExpandedSection('password')
    }
  }, [errors, isFast])

  const getButtonText = () => {
    if (!isFast) return t('next')
    return expandedSection === 'password' ? t('get_started') : t('next')
  }

  return (
    <VStack as="form" onSubmit={handleSubmit(handleFormSubmit)} fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        secondaryControls={<KeygenEducationPrompt />}
        title={t('new_vault_setup')}
        hasBorder
      />
      <PageContent gap={12} flexGrow scrollable>
        <NameFormSection
          isExpanded={isFast ? expandedSection === 'name' : true}
          onToggle={() => setExpandedSection('name')}
          register={register('name')}
          error={errors.name?.message}
          value={values.name}
          onValueChange={v => setValue('name', v, { shouldValidate: true })}
          referralValue={values.referral || ''}
          onReferralValueChange={v =>
            setValue('referral', v, { shouldValidate: true })
          }
        />

        {isFast && (
          <>
            <EmailFormSection
              isExpanded={expandedSection === 'email'}
              onToggle={() => setExpandedSection('email')}
              register={register('email')}
              error={errors.email?.message}
              value={values.email || ''}
              onValueChange={v =>
                setValue('email', v, { shouldValidate: true })
              }
            />

            <PasswordFormSection
              isExpanded={expandedSection === 'password'}
              onToggle={() => setExpandedSection('password')}
              passwordRegister={register('password')}
              confirmPasswordRegister={register('confirmPassword')}
              hintRegister={register('hint')}
              passwordError={errors.password?.message}
              confirmPasswordError={errors.confirmPassword?.message}
              passwordValue={values.password || ''}
              confirmPasswordValue={values.confirmPassword || ''}
              hintValue={values.hint || ''}
              onPasswordChange={v =>
                setValue('password', v, { shouldValidate: true })
              }
              onConfirmPasswordChange={v =>
                setValue('confirmPassword', v, { shouldValidate: true })
              }
              onHintChange={v => setValue('hint', v, { shouldValidate: true })}
            />
          </>
        )}
      </PageContent>
      <PageFooter>
        <Button disabled={!isValid} type="button" onClick={handleNext}>
          {getButtonText()}
        </Button>
      </PageFooter>
    </VStack>
  )
}
