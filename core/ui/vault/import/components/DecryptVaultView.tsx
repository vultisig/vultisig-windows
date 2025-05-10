import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { PasswordInput } from '@lib/ui/inputs/PasswordInput'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { FC, useMemo } from 'react'
import { FieldValues, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

interface DecryptVaultViewProps {
  isPending: boolean
  error: Error | null
  onSubmit: (password: string) => void
}

export const DecryptVaultView: FC<DecryptVaultViewProps> = ({
  isPending,
  error,
  onSubmit,
}) => {
  const { t } = useTranslation()
  const formSchema = useMemo(
    () =>
      z.object({
        password: z.string().min(1, t('password_required')).max(50),
      }),
    [t]
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
  })

  return (
    <VStack
      as="form"
      onSubmit={handleSubmit(({ password }: FieldValues) => onSubmit(password))}
      fullHeight
    >
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('password')}</PageHeaderTitle>}
        hasBorder
      />
      <PageContent flexGrow scrollable>
        <VStack gap={12} flexGrow>
          <PasswordInput
            placeholder={t('enter_password')}
            {...register('password')}
          />
          {typeof errors.password?.message === 'string' ? (
            <Text color="danger" size={12}>
              {errors.password.message}
            </Text>
          ) : (
            error && <Text color="danger">{t('incorrect_password')}</Text>
          )}
        </VStack>
      </PageContent>
      <PageFooter>
        <Button
          isDisabled={!isValid || !isDirty}
          isLoading={isPending}
          type="submit"
        >
          {t('continue')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
