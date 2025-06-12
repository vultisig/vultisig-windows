import { getVaultFromServer } from '@core/mpc/fast/api/getVaultFromServer'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { PasswordInput } from '@lib/ui/inputs/PasswordInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { OnFinishProp } from '@lib/ui/props'
import { InfoBlock } from '@lib/ui/status/InfoBlock'
import { Text } from '@lib/ui/text'
import { useMutation } from '@tanstack/react-query'
import { TFunction } from 'i18next'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

const createSchema = (t: TFunction) => {
  const message = t('password_pattern_error', { min: 3, max: 30 })

  return z.object({ password: z.string().min(3, message).max(30, message) })
}

type Schema = z.infer<ReturnType<typeof createSchema>>

export const ServerPasswordStep: React.FC<
  OnFinishProp<{ password: string }>
> = ({ onFinish }) => {
  const { t } = useTranslation()
  const vault = useCurrentVault()

  const schema = useMemo(() => createSchema(t), [t])

  const { error, isPending, mutate } = useMutation({
    mutationFn: getVaultFromServer,
    onSuccess: onFinish,
  })

  const {
    formState: { errors, isValid },
    handleSubmit,
    register,
  } = useForm<Schema>({
    mode: 'onBlur',
    resolver: zodResolver(schema),
  })

  const onSubmit = ({ password }: Schema) => {
    mutate({ vaultId: getVaultId(vault), password })
  }

  return (
    <VStack as="form" onSubmit={handleSubmit(onSubmit)} fullHeight>
      <FlowPageHeader title={t('password')} />
      <PageContent flexGrow scrollable>
        <PasswordInput
          {...register('password')}
          error={errors.password?.message}
          label={t('fast_vault_password')}
          placeholder={t('enter_password')}
          validation={
            isValid ? 'valid' : errors.password ? 'invalid' : undefined
          }
        />
      </PageContent>
      <PageFooter gap={16}>
        <InfoBlock>{t('password_to_decrypt')}</InfoBlock>
        <Button disabled={!isValid} loading={isPending} type="submit">
          {t('continue')}
        </Button>
        {error?.message && (
          <Text color="danger" size={12}>
            {error.message}
          </Text>
        )}
      </PageFooter>
    </VStack>
  )
}
