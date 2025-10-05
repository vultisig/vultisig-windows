import { Chain } from '@core/chain/Chain'
import { RequestInput } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { NotImplementedError } from '@lib/utils/error/NotImplementedError'
import { TronWeb } from 'tronweb'

import { requestAccount } from './core/requestAccount'

export class TronLink {
  public isVultiConnect: boolean
  public isTronLink: boolean
  public tronWeb: TronWeb
  public ready: boolean

  constructor() {
    this.ready = false
    this.isVultiConnect = true
    this.isTronLink = true
    this.tronWeb = new TronWeb({
      solidityNode: 'https://api.trongrid.io',
      fullHost: 'https://api.trongrid.io',
    })
  }

  init() {
    this.injectTronLink()
  }

  injectTronLink() {
    if (typeof window !== 'undefined') {
      const tronLinkObj = {
        ready: false,
        request: this.request.bind(this),
        isVultiConnect: true,
        isTronLink: true,
      }

      window.tronLink = tronLinkObj
      window.tronWeb = this.tronWeb

      this.ready = true
      tronLinkObj.ready = true

      window.dispatchEvent(new CustomEvent('tronLink#initialized'))
    }
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
