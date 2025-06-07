import EventEmitter from 'events'
import { v4 as uuidv4 } from 'uuid'

import { MessageKey } from '../../utils/constants'
import { processBackgroundResponse } from '../../utils/functions'
import { Messaging } from '../../utils/interfaces'
import { Network } from '../constants'
import { messengers } from '../messenger'

export class Zcash extends EventEmitter {
  public chainId: string
  public network: Network
  public static instance: Zcash | null = null
  constructor() {
    super()
    this.chainId = 'ZCash_Zec'
    this.network = 'mainnet'
  }

  static getInstance(): Zcash {
    if (!Zcash.instance) {
      Zcash.instance = new Zcash()
    }
    return Zcash.instance
  }

  async request(data: Messaging.Chain.Request) {
    try {
      const response = await messengers.background.send<
        any,
        Messaging.Chain.Response
      >(
        'providerRequest',
        {
          type: MessageKey.ZCASH_REQUEST,
          message: data,
        },
        { id: uuidv4() }
      )
      return processBackgroundResponse(data, MessageKey.ZCASH_REQUEST, response)
    } catch (error) {
      throw error
    }
  }
}
