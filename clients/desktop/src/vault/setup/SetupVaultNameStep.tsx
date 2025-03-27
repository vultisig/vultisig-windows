import { zodResolver } from '@hookform/resolvers/zod'
import { OnBackProp, OnForwardProp } from '@lib/ui/props'
import { useMemo } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { ActionInsideInteractiveElement } from '../../lib/ui/base/ActionInsideInteractiveElement'
import { Button } from '../../lib/ui/buttons/Button'
import { iconButtonIconSizeRecord } from '../../lib/ui/buttons/IconButton'
import { UnstyledButton } from '../../lib/ui/buttons/UnstyledButton'
import {
  textInputHeight,
  textInputHorizontalPadding,
} from '../../lib/ui/css/textInput'
import { CircledCloseIcon } from '../../lib/ui/icons/CircledCloseIcon'
import { TextInput } from '../../lib/ui/inputs/TextInput'
import { VStack } from '../../lib/ui/layout/Stack'
import { Text } from '../../lib/ui/text'
import { PageContent } from '../../ui/page/PageContent'
import { PageHeader } from '../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton'
import { useVaultNames } from '../hooks/useVaultNames'
import { KeygenEducationPrompt } from '../keygen/shared/KeygenEducationPrompt'
import { MAX_VAULT_NAME_LENGTH } from './shared/constants'
import { useVaultType } from './shared/state/vaultType'
import { getDefaultVaultName } from './shared/utils/getDefaultVaultName'
import { useVaultName } from './state/vaultName'

export const SetupVaultNameStep = ({
  onForward,
  onBack,
}: OnForwardProp & Partial<OnBackProp>) => {
  const { t } = useTranslation()
  const existingVaultNames = useVaultNames()

  const vaultNameSchema = useMemo(
    () =>
      z.object({
        vaultName: z
          .string()
          .min(1, t('vault_name_required'))
          .max(MAX_VAULT_NAME_LENGTH, t('vault_name_max_length_error'))
          .refine(name => !existingVaultNames.includes(name), {
            message: t('vault_name_already_exists'),
          }),
      }),
    [existingVaultNames, t]
  )
  const [, setName] = useVaultName()
  const vaultType = useVaultType()
  const defaultVaultName = getDefaultVaultName(vaultType, existingVaultNames)

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof vaultNameSchema>>({
    resolver: zodResolver(vaultNameSchema),
    defaultValues: { vaultName: defaultVaultName },
    mode: 'all',
  })

  const onSubmit: SubmitHandler<z.infer<typeof vaultNameSchema>> = ({
    vaultName,
  }) => {
    setName(vaultName)
    onForward()
  }

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        secondaryControls={<KeygenEducationPrompt />}
      />
      <PageContent as="form" onSubmit={handleSubmit(onSubmit)} gap={16}>
        <VStack>
          <Text variant="h1Regular">Name your vault</Text>
          <Text size={14} color="shy">
            You can always rename your vault later in settings
          </Text>
        </VStack>
        <VStack flexGrow gap={4}>
          <ActionInsideInteractiveElement
            render={() => (
              <Controller
                name="vaultName"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    placeholder={t('enter_vault_name')}
                    value={field.value}
                    onValueChange={field.onChange}
                    autoFocus
                  />
                )}
              />
            )}
            action={
              <UnstyledButton onClick={() => setValue('vaultName', '')}>
                <CircledCloseIcon />
              </UnstyledButton>
            }
            actionPlacerStyles={{
              right: textInputHorizontalPadding,
              bottom: (textInputHeight - iconButtonIconSizeRecord.l) / 2,
            }}
          />
          {errors.vaultName && errors.vaultName.message && (
            <Text color="danger" size={12}>
              {errors.vaultName.message}
            </Text>
          )}
        </VStack>
        <Button type="submit" isDisabled={Boolean(errors.vaultName?.message)}>
          {t('next')}
        </Button>
      </PageContent>
    </>
  )
}
