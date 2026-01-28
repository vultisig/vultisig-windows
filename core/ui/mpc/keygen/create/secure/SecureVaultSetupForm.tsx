import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useVaultName } from '@core/ui/mpc/keygen/create/state/vaultName'
import { KeygenEducationPrompt } from '@core/ui/mpc/keygen/education/KeygenEducationPrompt'
import { useVaultNames } from '@core/ui/storage/vaults'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { TFunction } from 'i18next'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { NameFormSection } from '../components/NameFormSection'

const maxVaultNameLength = 50

type SecureVaultSetupFormProps = OnFinishProp & Partial<OnBackProp>

const getSecureVaultSchema = (t: TFunction, existingVaultNames: string[]) =>
  z.object({
    name: z
      .string()
      .min(1, t('vault_name_required'))
      .max(maxVaultNameLength, t('vault_name_max_length_error'))
      .refine(
        name => !existingVaultNames.includes(name),
        t('vault_name_already_exists')
      ),
  })

type SecureVaultFormValues = z.infer<ReturnType<typeof getSecureVaultSchema>>

export const SecureVaultSetupForm = ({
  onFinish,
  onBack,
}: SecureVaultSetupFormProps) => {
  const { t } = useTranslation()
  const existingVaultNames = useVaultNames()
  const [storedName, setStoredName] = useVaultName()

  const schema = useMemo(
    () => getSecureVaultSchema(t, existingVaultNames),
    [t, existingVaultNames]
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<SecureVaultFormValues>({
    defaultValues: {
      name: storedName,
    },
    mode: 'all',
    resolver: zodResolver(schema),
  })

  const values = watch()

  const onSubmit = (data: SecureVaultFormValues) => {
    setStoredName(data.name)
    onFinish()
  }

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
          isExpanded={true}
          onToggle={() => {}}
          register={register('name')}
          error={errors.name?.message}
          value={values.name}
          onValueChange={v => setValue('name', v, { shouldValidate: true })}
        />
      </PageContent>
      <PageFooter>
        <Button disabled={!isValid} type="submit">
          {t('next')}
        </Button>
      </PageFooter>
    </VStack>
  )
}
