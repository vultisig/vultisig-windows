import { MessageKey } from '../../utils/constants'
import { BaseCosmosChain } from './baseCosmos'

export class MAYAChain extends BaseCosmosChain {
  public static instance: MAYAChain | null = null
  public messageKey = MessageKey.MAYA_REQUEST

  private constructor() {
    super('Thorchain_mayachain')
  }

  static getInstance(): MAYAChain {
    if (!MAYAChain.instance) {
      MAYAChain.instance = new MAYAChain()
    }
    return MAYAChain.instance
  }
}
