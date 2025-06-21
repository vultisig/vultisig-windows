import { PluginMetadata } from '@core/ui/mpc/keygen/reshare/plugin/PluginReshareFlow'
import { OnFinishProp, ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'

import { initializeMessenger } from '../../messengers/initializeMessenger'
import api from '../../utils/api'
import { getStoredPendingRequest } from '../../utils/pendingRequests'

const backgroundMessenger = initializeMessenger({ connect: 'background' })

export const PluginReshareMutation = ({
  value,
  onFinish,
}: ValueProp<string> & OnFinishProp<PluginMetadata>) => {
  const { mutate: processPluginReshare, ...mutationState } = useMutation({
    mutationFn: async (joinUrl: string) => {
      const request = await getStoredPendingRequest('plugin')
      if (!request) {
        throw new Error('No plugin request found')
      }
      const pluginInfo = await api.plugin.fetchPluginInfo(request.id)
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

  return <MatchQuery value={mutationState} />
}
