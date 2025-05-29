import { v4 as uuidv4 } from 'uuid'
import { MessageKey } from '../../utils/constants'
import { Messaging } from '../../utils/interfaces'
import { messengers } from '../messenger'

export class PluginProvider {
  public static instance: PluginProvider | null = null
  public messageKey = MessageKey.PLUGIN

  private constructor() {
    if (PluginProvider.instance) {
      throw new Error(
        'PluginProvider is a singleton and cannot be instantiated multiple times.'
      )
    }
    PluginProvider.instance = this
  }

  static getInstance(): PluginProvider {
    if (!PluginProvider.instance) {
      PluginProvider.instance = new PluginProvider()
    }
    return PluginProvider.instance
  }

  async request(data: Messaging.Plugin.Request) {
    try {
      const response = await messengers.background.send<
        any,
        Messaging.Plugin.Response
      >(
        'providerRequest',
        {
          type: this.messageKey,
          message: data,
        },
        { id: uuidv4() }
      )
      return response
    } catch (error) {
      throw error
    }
  }
}
