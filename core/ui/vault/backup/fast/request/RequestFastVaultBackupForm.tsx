import { resendVaultShare } from '@core/mpc/fast/api/resendVaultShare'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { zodResolver } from '@hookform/resolvers/zod'
import { ActionInsideInteractiveElement } from '@lib/ui/base/ActionInsideInteractiveElement'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton, iconButtonSize } from '@lib/ui/buttons/IconButton'
import {
  textInputHeight,
  textInputHorizontalPadding,
} from '@lib/ui/css/textInput'
import { CircleCrossIcon } from '@lib/ui/icons/CircleCrossIcon'
import { PasswordInput } from '@lib/ui/inputs/PasswordInput'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { OnFinishProp } from '@lib/ui/props'
import { ErrorBlock } from '@lib/ui/status/ErrorBlock'
import { Text } from '@lib/ui/text'
import { isInError } from '@lib/utils/error/isInError'
import { useMutation } from '@tanstack/react-query'
import { TFunction } from 'i18next'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

const getSchema = (t: TFunction) =>
  z.object({
    email: z.email(t('invalid_email')),
    password: z.string().min(1, { message: t('password_required') }),
  })

type Schema = z.infer<ReturnType<typeof getSchema>>

export const RequestFastVaultBackupForm = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()
  const vault = useCurrentVault()

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
    formState: { errors, isValid },
  } = useForm<Schema>({
    resolver: zodResolver(schema),
  })

  const errorMessage = useMemo(() => {
    if (!error) {
      return
    }

    if (isInError(error, '429')) {
      return t('vault_server_share_too_many_requests')
    }

    return t('vault_server_share_bad_request')
  }, [error, t])

  return (
    <VStack
      as="form"
      onSubmit={handleSubmit(({ email, password }) =>
        mutate({ email, password })
      )}
      gap={24}
    >
      {errorMessage && <ErrorBlock>{errorMessage}</ErrorBlock>}
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
        {errors.email?.message && (
          <Text color="danger" size={12}>
            {errors.email.message}
          </Text>
        )}
      </VStack>
      <VStack gap={4}>
        <PasswordInput
          {...register('password')}
          error={errors.password?.message}
          placeholder={t('enter_password')}
          validation={errors.password ? 'invalid' : undefined}
        />
      </VStack>
      <Button disabled={!isValid} loading={isPending} type="submit">
        {t('next')}
      </Button>
    </VStack>
  )
}
