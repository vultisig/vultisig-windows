import { v4 as uuidv4 } from 'uuid'

import { MessageKey } from '../../utils/constants'
import { Messaging } from '../../utils/interfaces'
import { messengers } from '../messenger'

export const requestPlugin = async (
  data: Messaging.Plugin.Request
): Promise<Messaging.Plugin.Response> => {
  return messengers.background.send<any, Messaging.Plugin.Response>(
    'providerRequest',
    {
      type: MessageKey.PLUGIN,
      message: data,
    },
    { id: uuidv4() }
  )
}
