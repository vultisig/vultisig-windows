import { getVaultFromServer } from '@core/mpc/fast/api/getVaultFromServer'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { passwordLenghtConfig } from '@core/ui/security/password/config'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { PasswordInput } from '@lib/ui/inputs/PasswordInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useMutation } from '@tanstack/react-query'
import { TFunction } from 'i18next'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

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

type ServerPasswordStepProps = Partial<OnBackProp> &
  OnFinishProp<{ password: string }> & {
    description?: string
  }

export const ServerPasswordStep: React.FC<ServerPasswordStepProps> = ({
  description,
  onBack,
  onFinish,
}) => {
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
    mode: 'onChange',
    resolver: zodResolver(schema),
  })

  const onSubmit = ({ password }: Schema) => {
    mutate({ vaultId: getVaultId(vault), password })
  }

  const passwordErrorMessage = useMemo(() => {
    if (error) {
      return t('incorrect_password')
    }

    return errors.password?.message
  }, [error, errors.password, t])

  return (
    <VStack as="form" onSubmit={handleSubmit(onSubmit)} fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={t('confirm')}
        hasBorder
      />
      <PageContent gap={36} scrollable>
        <VStack alignItems="center" gap={12}>
          <Text size={28} weight={500} centerHorizontally>
            {t('enter_your_password')}
          </Text>
          {description ? (
            <Text color="shy" size={14} weight={500} centerHorizontally>
              {description}
            </Text>
          ) : null}
        </VStack>
        <PasswordInput
          {...register('password')}
          error={passwordErrorMessage}
          placeholder={t('enter_password')}
          validation={passwordErrorMessage ? 'invalid' : undefined}
        />
      </PageContent>
      <PageFooter>
        <Button disabled={!isValid} loading={isPending} type="submit">
          {t('confirm')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
