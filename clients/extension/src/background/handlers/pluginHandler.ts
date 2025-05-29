import { match } from '@lib/utils/match'
import { Messenger } from '../../messengers/createMessenger'
import { Messaging } from '../../utils/interfaces'
import { handleOpenPanel } from '../window/windowManager'
import { RequestMethod } from '../../utils/constants'

export const handlePluginRequest = async (
  request: Messaging.Plugin.Request,
  sender: string,
  popupMessenger: Messenger
): Promise<Messaging.Plugin.Response> => {
  return new Promise((resolve, reject) => {
    match(request.method, {
      [RequestMethod.VULTISIG.PLUGIN_REQUEST_RESHARE]: async () => {
        handleOpenPanel({ id: 'pluginTab' })
        popupMessenger.reply(
          'plugin:reshare',
          async ({ joinUrl }: { joinUrl: string }) => {
            console.log('joinUrl in pluginHandler:', joinUrl)

            resolve(joinUrl)
            return
          }
        )
      },
    })
  })
}
