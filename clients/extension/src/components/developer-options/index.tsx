import {
  DeveloperOptions,
  getDeveloperOptions,
  setDeveloperOptions,
} from '@core/extension/storage/developerOptions'
import { useCore } from '@core/ui/state/core'
import {
  useIsMLDSAEnabled,
  useSetIsMLDSAEnabledMutation,
} from '@core/ui/storage/mldsaEnabled'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { Switch } from '@lib/ui/inputs/switch'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { Text } from '@lib/ui/text'
import { TFunction } from 'i18next'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

const getSchema = (t: TFunction) =>
  z.object({
    pluginMarketplaceBaseUrl: z.string().url({ message: t('incorrect_url') }),
    appInstallTimeout: z
      .number({ message: t('app_install_timeout_invalid') })
      .finite({ message: t('app_install_timeout_invalid') })
      .min(0, { message: t('app_install_timeout_min') }),
  })

export const ExtensionDeveloperOptions = () => {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const { version } = useCore()
  const clickCount = useRef(0)
  const refetchQueries = useRefetchQueries()
  const isMLDSAEnabled = useIsMLDSAEnabled()
  const { mutate: setIsMLDSAEnabled } = useSetIsMLDSAEnabledMutation()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<DeveloperOptions>({
    defaultValues: async () => await getDeveloperOptions(),
    mode: 'all',
    resolver: zodResolver(getSchema(t)),
  })

  const onSubmit = async (data: DeveloperOptions) => {
    await setDeveloperOptions(data)
    refetchQueries([StorageKey.developerOptions])
    setVisible(false)
  }

  const handleClick = () => {
    if (clickCount.current < 2) {
      clickCount.current += 1
    } else {
      clickCount.current = 0

      setVisible(true)
    }
  }

  return (
    <>
      <UnstyledButton onClick={handleClick}>
        {`VULTISIG EXTENSION V${version}`}
      </UnstyledButton>

      {visible && (
        <Modal onClose={() => setVisible(false)} title={t('developer_options')}>
          <VStack gap={16} fullHeight>
            <Switch
              checked={isMLDSAEnabled}
              label={t('enable_mldsa')}
              onChange={() => setIsMLDSAEnabled(!isMLDSAEnabled)}
            />
            <VStack
              as="form"
              gap={16}
              onSubmit={handleSubmit(onSubmit)}
              fullHeight
            >
              <VStack gap={8}>
                <TextInput
                  {...register('pluginMarketplaceBaseUrl')}
                  label={t('plugin_server_url')}
                  onValueChange={value =>
                    setValue('pluginMarketplaceBaseUrl', value)
                  }
                  validation={
                    isValid
                      ? 'valid'
                      : errors.pluginMarketplaceBaseUrl
                        ? 'invalid'
                        : undefined
                  }
                  autoFocus
                />
                {errors.pluginMarketplaceBaseUrl &&
                  errors.pluginMarketplaceBaseUrl.message && (
                    <Text color="danger" size={12}>
                      {errors.pluginMarketplaceBaseUrl.message}
                    </Text>
                  )}
                <TextInput
                  {...register('appInstallTimeout', { valueAsNumber: true })}
                  label={t('app_install_timeout')}
                  validation={
                    isValid
                      ? 'valid'
                      : errors.appInstallTimeout
                        ? 'invalid'
                        : undefined
                  }
                  type="number"
                />
                {errors.appInstallTimeout &&
                  errors.appInstallTimeout.message && (
                    <Text color="danger" size={12}>
                      {errors.appInstallTimeout.message}
                    </Text>
                  )}
              </VStack>
              <Button disabled={!isValid} type="submit">
                {t('save')}
              </Button>
            </VStack>
          </VStack>
        </Modal>
      )}
    </>
  )
}
