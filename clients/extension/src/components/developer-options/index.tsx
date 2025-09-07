import {
  DeveloperOptions,
  getDeveloperOptions,
  setDeveloperOptions,
} from '@core/extension/storage/developerOptions'
import { useCore } from '@core/ui/state/core'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { TextInput } from '@lib/ui/inputs/TextInput'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { Text } from '@lib/ui/text'
import { TFunction } from 'i18next'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

const getSchema = (t: TFunction) =>
  z.object({
    pluginMarketplaceBaseUrl: z.string().url({ message: t('incorrect_url') }),
  })

export const ExtensionDeveloperOptions = () => {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const { version } = useCore()
  const clickCount = useRef(0)
  const invalidateQueries = useInvalidateQueries()

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
    invalidateQueries([StorageKey.developerOptions])
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
            </VStack>
            <Button
              disabled={errors.pluginMarketplaceBaseUrl?.message}
              type="submit"
            >
              {t('save')}
            </Button>
          </VStack>
        </Modal>
      )}
    </>
  )
}
