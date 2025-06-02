import { match } from '@lib/utils/match'

import { Messenger } from '../../messengers/createMessenger'
import { RequestMethod } from '../../utils/constants'
import { Messaging } from '../../utils/interfaces'
import { handleOpenPanel } from '../window/windowManager'

export const handlePluginRequest = async (
  request: Messaging.Plugin.Request,
  popupMessenger: Messenger
): Promise<Messaging.Plugin.Response> => {
  return match(request.method, {
    [RequestMethod.VULTISIG.PLUGIN_REQUEST_RESHARE]: async () => {
      handleOpenPanel({ id: 'pluginTab' })
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
  })
}
