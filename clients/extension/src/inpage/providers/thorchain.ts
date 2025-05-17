import { MessageKey } from '../../utils/constants'
import { BaseCosmosChain } from './baseCosmos'

export class THORChain extends BaseCosmosChain {
  public static instance: THORChain | null = null
  public messageKey = MessageKey.THOR_REQUEST

  private constructor() {
    super('Thorchain_thorchain')
  }

  static getInstance(): THORChain {
    if (!THORChain.instance) {
      THORChain.instance = new THORChain()
    }
    return THORChain.instance
  }
}
