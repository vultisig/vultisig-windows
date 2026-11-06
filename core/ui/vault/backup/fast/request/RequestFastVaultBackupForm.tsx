import { SettingsCtaButton } from '@core/ui/settings/SettingsCtaButton'
import { ActionForm } from '@core/ui/vault/components/action-form/ActionForm'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { zodResolver } from '@hookform/resolvers/zod'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { VStack } from '@lib/ui/layout/Stack'
import { OnFinishProp } from '@lib/ui/props'
import { ErrorBlock } from '@lib/ui/status/ErrorBlock'
import { useMutation } from '@tanstack/react-query'
import { resendVaultShare } from '@vultisig/core-mpc/fast/api/resendVaultShare'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { isInError } from '@vultisig/lib-utils/error/isInError'
import { TFunction } from 'i18next'
import { useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { z } from 'zod'

import { ManageEmailField } from './components/ManageEmailField'
import { ManagePasswordField } from './components/ManagePasswordField'
import { BackupFormFieldsStateProvider } from './state/focusedField'

const Form = styled(ActionForm)`
  padding-bottom: 24px;
  padding-top: 24px;
`

const ErrorBanner = styled(ErrorBlock)`
  ${borderRadius.xl};
  background: ${({ theme }) =>
    theme.colors.danger.getVariant({ a: () => 0.05 }).toCssValue()};

  svg {
    flex-shrink: 0;
    font-size: 16px;
  }

  > :last-child {
    letter-spacing: 0.06px;
    line-height: 18px;
  }
`

const getSchema = (t: TFunction) =>
  z.object({
    email: z.email(t('incorrect_email')),
    password: z.string().min(1, { message: t('password_required') }),
  })

type Schema = z.infer<ReturnType<typeof getSchema>>

const RequestFastVaultBackupFormContent = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()
  const vault = useCurrentVault()

  const schema = useMemo(() => getSchema(t), [t])

  // Synchronous in-flight guard: `isPending` only disables the submit button
  // after a re-render, so a fast double-submit can fire two /resend requests
  // (two backup emails) before that commits. A ref blocks the second submit in
  // the same tick, before any render happens.
  const isRequestingRef = useRef(false)

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ email, password }: Schema) =>
      resendVaultShare({
        public_key_ecdsa: getVaultId(vault),
        email,
        password,
      }),
    onSuccess: onFinish,
    onSettled: () => {
      isRequestingRef.current = false
    },
  })

  const requestBackup = (values: Schema) => {
    if (isRequestingRef.current) {
      return
    }
    isRequestingRef.current = true
    mutate(values)
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
  })

  const emailValue = watch('email') ?? ''

  const isEmailStructurallyValid =
    !!emailValue && z.string().email().safeParse(emailValue).success

  const errorMessage = useMemo(() => {
    if (!error) return undefined

    if (isInError(error, '429')) {
      return t('vault_server_share_too_many_requests')
    }

    return t('vault_server_share_bad_request')
  }, [error, t])

  return (
    <Form
      as="form"
      justifyContent="space-between"
      scrollable
      gap={40}
      onSubmit={handleSubmit(requestBackup)}
    >
      <VStack gap={16}>
        <ManageEmailField
          registration={register('email')}
          onValueChange={value => setValue('email', value)}
          onClear={() => setValue('email', '')}
          error={errors.email?.message}
          isEmailValid={isEmailStructurallyValid}
          email={emailValue}
        />
        <ManagePasswordField
          registration={register('password')}
          error={errors.password?.message}
        />
        {errorMessage && <ErrorBanner>{errorMessage}</ErrorBanner>}
      </VStack>
      <SettingsCtaButton
        disabled={!isValid || isPending}
        loading={isPending}
        type="submit"
      >
        {t('get_started')}
      </SettingsCtaButton>
    </Form>
  )
}

/** Asks the server to email this vault's share, given the email and vault password. */
export const RequestFastVaultBackupForm = ({ onFinish }: OnFinishProp) => (
  <BackupFormFieldsStateProvider initialValue={{ field: 'email' }}>
    <RequestFastVaultBackupFormContent onFinish={onFinish} />
  </BackupFormFieldsStateProvider>
)
