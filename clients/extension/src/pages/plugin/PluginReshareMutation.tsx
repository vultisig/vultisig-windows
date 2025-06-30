import { PluginMetadata } from '@core/ui/mpc/keygen/reshare/plugin/PluginReshareFlow'
import { Center } from '@lib/ui/layout/Center'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { OnFinishProp, ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { StrictText } from '@lib/ui/text'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { initializeMessenger } from '../../messengers/initializeMessenger'
import api from '../../utils/api'
import { getStoredPendingRequest } from '../../utils/pendingRequests'

const backgroundMessenger = initializeMessenger({ connect: 'background' })

export const PluginReshareMutation = ({
  value,
  onFinish,
}: ValueProp<string> & OnFinishProp<PluginMetadata>) => {
  const { t } = useTranslation()
  const { mutate: processPluginReshare, ...mutationState } = useMutation({
    mutationFn: async (joinUrl: string) => {
      const request = await getStoredPendingRequest('plugin')
      if (!request) {
        throw new Error('No plugin reshare request found')
      }
      const pluginInfo = await api.plugin.fetchPluginInfo(request.payload.id)
      if (!pluginInfo) {
        throw new Error('Could not fetch plugin info')
      }
      await backgroundMessenger.send('plugin:reshare', {
        joinUrl,
      })

      return pluginInfo
    },
    onSuccess: (pluginInfo: PluginMetadata) => {
      onFinish(pluginInfo)
    },
  })

  useEffect(() => {
    processPluginReshare(value)
  }, [processPluginReshare, value])

  return (
    <MatchQuery
      value={mutationState}
      pending={() => (
        <Center>
          <Spinner />
        </Center>
      )}
      error={() => (
        <Center>
          <StrictText>{t('failed_to_process_plugin_install')}</StrictText>
        </Center>
      )}
    />
  )
}
