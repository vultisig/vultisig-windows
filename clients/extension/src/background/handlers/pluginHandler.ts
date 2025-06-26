import { match } from '@lib/utils/match'

import { Messenger } from '../../messengers/createMessenger'
import { RequestMethod } from '../../utils/constants'
import { Messaging } from '../../utils/interfaces'
import { setStoredPendingRequest } from '../../utils/pendingRequests'
import { handleOpenPanel } from '../window/windowManager'
import { base64 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'

export const handlePluginRequest = async (
  request: Messaging.Plugin.Request,
  popupMessenger: Messenger
): Promise<Messaging.Plugin.Response> => {
  const [params] = request.params || []
  if (!params) {
    throw new Error('Missing required params in plugin request')
  }
  return match(request.method, {
    [RequestMethod.VULTISIG.PLUGIN_REQUEST_RESHARE]: async () => {
      await setStoredPendingRequest('plugin', {
        type: 'ReshareRequest',
        payload: { id: params.id },
      })
      await handleOpenPanel({ id: 'pluginTab' })

      return new Promise((resolve, reject) => {
        popupMessenger.reply(
          'plugin:reshare',
          ({ joinUrl }: { joinUrl: string }) => {
            if (!joinUrl || typeof joinUrl !== 'string') {
              reject(new Error('Invalid or missing joinUrl'))
              return
            }
            resolve(joinUrl)
          }
        )
      })
    },
    [RequestMethod.VULTISIG.PLUGIN_CREATE_POLICY]: async () => {
      await setStoredPendingRequest('plugin', {
        type: 'PluginCreatePolicy',
        payload: {
          recipe: params.recipe,
          publicKey: params.publicKey,
          pluginVersion: params.pluginVersion,
          policyVersion: params.policyVersion,
        },
      })

      await handleOpenPanel({ id: 'pluginTab' })
      return ''
    },
  })
}
