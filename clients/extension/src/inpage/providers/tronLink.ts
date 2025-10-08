import { Chain } from '@core/chain/Chain'
import { RequestInput } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { NotImplementedError } from '@lib/utils/error/NotImplementedError'

import { requestAccount } from './core/requestAccount'
import { VultisigTronWeb } from './tronWeb/tronWeb'

export class TronLink {
  public isVultiConnect: boolean
  public isTronLink: boolean
  public tronWeb: VultisigTronWeb
  public ready: boolean

  constructor() {
    this.isVultiConnect = true
    this.isTronLink = true
    this.tronWeb = new VultisigTronWeb()
    this.ready = false
  }
  init = () => {
    window.tronWeb = this.tronWeb
  }
  request = async (data: RequestInput) => {
    const handlers = {
      tron_requestAccounts: async () => {
        const { address } = await requestAccount(Chain.Tron)
        if (address) {
          this.tronWeb.setAddress(address)
          return {
            code: 200,
            message: 'User allowed the request.',
            data: {
              address: address,
            },
          }
        }
        throw new Error('User rejected the request')
      },
    } as const

    if (data.method in handlers) {
      return handlers[data.method as keyof typeof handlers]()
    }

    throw new NotImplementedError(`Tron method ${data.method}`)
  }
}
