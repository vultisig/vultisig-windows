import { MessageKey } from '../../utils/constants'
import { BaseCosmosChain } from './baseCosmos'

export class Cosmos extends BaseCosmosChain {
  public static instance: Cosmos | null = null
  public messageKey = MessageKey.COSMOS_REQUEST

  private constructor() {
    super('Cosmos')
  }

  static getInstance(): Cosmos {
    if (!Cosmos.instance) {
      Cosmos.instance = new Cosmos()
    }
    return Cosmos.instance
  }
}
