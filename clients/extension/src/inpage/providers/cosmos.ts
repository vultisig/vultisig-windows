import EventEmitter from 'events'
import { Messaging } from '../../utils/interfaces'
import { messengers } from '../messenger'
import { Callback } from '..'
import { MessageKey } from '../../utils/constants'
import { v4 as uuidv4 } from 'uuid'
import { processBackgroundResponse } from '../../utils/functions'

export class Cosmos extends EventEmitter {
  public isVultiConnect: boolean

  constructor() {
    super()
    this.isVultiConnect = true
  }

  async request(data: Messaging.Chain.Request, callback?: Callback) {
    try {
      const response = await messengers.background.send<
        any,
        Messaging.Chain.Response
      >(
        'providerRequest',
        {
          type: MessageKey.COSMOS_REQUEST,
          message: data,
        },
        { id: uuidv4() }
      )

      const result = processBackgroundResponse(
        data,
        MessageKey.COSMOS_REQUEST,
        response
      )

      if (callback) callback(null, result)

      return result
    } catch (error) {
      if (callback) callback(error as Error)
      return error
    }
  }
}
