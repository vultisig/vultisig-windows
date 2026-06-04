import {
  DeveloperOptions,
  getDeveloperOptions,
  setDeveloperOptions,
} from '@core/extension/storage/developerOptions'
import {
  currentProductBrand,
  currentProductBrandConfig,
} from '@core/ui/product/brand'
import { useCore } from '@core/ui/state/core'
import { StorageKey } from '@core/ui/storage/StorageKey'
import {
  useIsTssBatchingEnabled,
  useSetIsTssBatchingEnabledMutation,
} from '@core/ui/storage/tssBatchingEnabled'
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
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import {
  getPushServerUrl,
  setPushServerUrl,
} from '../../notifications/pushNotificationStorage'

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
  const isTssBatchingEnabled = useIsTssBatchingEnabled()
  const { mutate: setIsTssBatchingEnabled } =
    useSetIsTssBatchingEnabledMutation()
  const [pushServerUrlValue, setPushServerUrlValue] = useState('')
  const shouldShowPluginServerUrl = currentProductBrand !== 'station'

  useEffect(() => {
    if (visible) {
      getPushServerUrl().then(url => setPushServerUrlValue(url ?? ''))
    }
  }, [visible])

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
        <Text size={12} color="shy">
          {`${currentProductBrandConfig.extensionName.toUpperCase()} V${version}`}
        </Text>
      </UnstyledButton>

      {visible && (
        <Modal onClose={() => setVisible(false)} title={t('developer_options')}>
          <VStack gap={16} fullHeight>
            <Switch
              checked={isTssBatchingEnabled}
              label={t('enable_tss_batching')}
              onChange={() => setIsTssBatchingEnabled(!isTssBatchingEnabled)}
            />
            <VStack gap={4}>
              <TextInput
                label={t('push_notification_server_url')}
                value={pushServerUrlValue}
                onValueChange={setPushServerUrlValue}
                placeholder={t('push_notification_server_placeholder')}
                data-testid="push-server-url-input"
              />
              <Button
                kind="secondary"
                size="sm"
                onClick={async () => {
                  await setPushServerUrl(pushServerUrlValue)
                }}
                data-testid="save-push-server-url"
              >
                {t('save')}
              </Button>
            </VStack>
            <VStack
              as="form"
              gap={16}
              onSubmit={handleSubmit(onSubmit)}
              fullHeight
            >
              <VStack gap={8}>
                {shouldShowPluginServerUrl && (
                  <>
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
                  </>
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
