import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { PasswordInput } from '@lib/ui/inputs/PasswordInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { Text } from '@lib/ui/text'
import { TFunction } from 'i18next'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { passwordLenghtConfig } from '../../../security/password/config'

const createSchema = (t: TFunction) => {
  const message = t('password_pattern_error', passwordLenghtConfig)

  return z.object({
    password: z
      .string()
      .min(passwordLenghtConfig.min, message)
      .max(passwordLenghtConfig.max, message),
  })
}

type Schema = z.infer<ReturnType<typeof createSchema>>

type DecryptVaultViewProps = {
  isPending: boolean
  error: Error | null
  onSubmit: (password: string) => void
}

export const DecryptVaultView = ({
  isPending,
  error,
  onSubmit,
}: DecryptVaultViewProps) => {
  const { t } = useTranslation()

  const schema = useMemo(() => createSchema(t), [t])

  const {
    formState: { errors, isValid },
    handleSubmit,
    register,
  } = useForm<Schema>({
    mode: 'onBlur',
    resolver: zodResolver(schema),
  })

  return (
    <VStack
      as="form"
      onSubmit={handleSubmit(({ password }) => onSubmit(password))}
      fullHeight
    >
      <FlowPageHeader title={t('password')} />
      <PageContent flexGrow scrollable>
        <PasswordInput
          {...register('password')}
          error={errors.password?.message}
          label={t('vault_password')}
          placeholder={t('enter_password')}
          validation={
            isValid ? 'valid' : errors.password ? 'invalid' : undefined
          }
        />
      </PageContent>
      <PageFooter gap={16}>
        <Button disabled={!isValid} loading={isPending} type="submit">
          {t('continue')}
        </Button>
        {error?.message && (
          <Text color="danger" size={12}>
            {t('incorrect_password')}
          </Text>
        )}
      </PageFooter>
    </VStack>
  )
}
