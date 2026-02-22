import { resendVaultShare } from '@core/mpc/fast/api/resendVaultShare'
import { getVaultId } from '@core/mpc/vault/Vault'
import { ActionForm } from '@core/ui/vault/components/action-form/ActionForm'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { OnFinishProp } from '@lib/ui/props'
import { ErrorBlock } from '@lib/ui/status/ErrorBlock'
import { isInError } from '@lib/utils/error/isInError'
import { useMutation } from '@tanstack/react-query'
import { TFunction } from 'i18next'
import { useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { ManageEmailField } from './components/ManageEmailField'
import { ManagePasswordField } from './components/ManagePasswordField'
import {
  BackupFormFieldsStateProvider,
  useBackupFormFieldState,
} from './state/focusedField'

const getSchema = (t: TFunction) =>
  z.object({
    email: z.email(t('incorrect_email')),
    password: z.string().min(1, { message: t('password_required') }),
  })

type Schema = z.infer<ReturnType<typeof getSchema>>

const RequestFastVaultBackupFormContent = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const [{ field }, setFocusedField] = useBackupFormFieldState()

  const schema = useMemo(() => getSchema(t), [t])

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ email, password }: Schema) =>
      resendVaultShare({
        public_key_ecdsa: getVaultId(vault),
        email,
        password,
      }),
    onSuccess: onFinish,
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  })

  const emailValue = watch('email') ?? ''
  const hasAutoTransitioned = useRef(false)

  const isEmailStructurallyValid =
    !!emailValue && z.string().email().safeParse(emailValue).success

  useEffect(() => {
    if (
      field === 'email' &&
      isEmailStructurallyValid &&
      !hasAutoTransitioned.current
    ) {
      hasAutoTransitioned.current = true
      setFocusedField(state => ({ ...state, field: 'password' }))
    }

    if (field === 'email' && !isEmailStructurallyValid) {
      hasAutoTransitioned.current = false
    }
  }, [emailValue, isEmailStructurallyValid, field, setFocusedField])

  const errorMessage = useMemo(() => {
    if (!error) return undefined

    if (isInError(error, '429')) {
      return t('vault_server_share_too_many_requests')
    }

    return t('vault_server_share_bad_request')
  }, [error, t])

  return (
    <ActionForm
      as="form"
      justifyContent="space-between"
      scrollable
      gap={40}
      onSubmit={handleSubmit(({ email, password }) =>
        mutate({ email, password })
      )}
    >
      <VStack gap={16}>
        {errorMessage && <ErrorBlock>{errorMessage}</ErrorBlock>}
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
      </VStack>
      <Button disabled={!isValid} loading={isPending} type="submit">
        {t('get_started')}
      </Button>
    </ActionForm>
  )
}

export const RequestFastVaultBackupForm = ({ onFinish }: OnFinishProp) => (
  <BackupFormFieldsStateProvider initialValue={{ field: 'email' }}>
    <RequestFastVaultBackupFormContent onFinish={onFinish} />
  </BackupFormFieldsStateProvider>
)
