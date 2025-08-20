import { UtxoChain } from '@core/chain/Chain'
import { callBackground } from '@core/inpage-provider/background'
import { attempt, withFallback } from '@lib/utils/attempt'
import EventEmitter from 'events'
import { v4 as uuidv4 } from 'uuid'

import { EventMethod, MessageKey, RequestMethod } from '../../utils/constants'
import { processBackgroundResponse } from '../../utils/functions'
import { Messaging, ProviderId } from '../../utils/interfaces'
import { Callback } from '../constants'
import { messengers } from '../messenger'

type SupportedUtxoChain =
  | UtxoChain.Bitcoin
  | UtxoChain.BitcoinCash
  | UtxoChain.Dogecoin
  | UtxoChain.Litecoin
  | UtxoChain.Zcash

export class UTXO extends EventEmitter {
  public chain: UtxoChain
  private providerType: MessageKey
  public static instances: Map<string, UTXO>
  private providerId: ProviderId
  constructor(
    providerType: string,
    chain: SupportedUtxoChain,
    providerId: ProviderId = 'vultisig'
  ) {
    super()
    this.providerType = providerType as MessageKey
    this.chain = chain
    this.providerId = providerId
  }

  static getInstance(
    providerType: string,
    chain: SupportedUtxoChain,
    providerId: ProviderId
  ): UTXO {
    if (!UTXO.instances) {
      UTXO.instances = new Map<string, UTXO>()
    }

    if (!UTXO.instances.has(providerType)) {
      UTXO.instances.set(
        providerType,
        new UTXO(providerType, chain, providerId)
      )
    }
    return UTXO.instances.get(providerType)!
  }

  async requestAccounts() {
    const address = await this.request({
      method: RequestMethod.VULTISIG.REQUEST_ACCOUNTS,
      params: [],
      context: { provider: this.providerId },
    })
    return address
  }

  async getAccounts() {
    return withFallback(
      attempt(async () => [
        await callBackground({
          getAddress: {
            chain: this.chain,
          },
        }),
      ]),
      []
    )
  }

  async signPSBT(_psbt: string | Buffer) {
    return await this.request({
      method: RequestMethod.CTRL.SIGN_PSBT,
      params: [],
      context: { provider: this.providerId },
    })
  }

  emitAccountsChanged() {
    this.emit(EventMethod.ACCOUNTS_CHANGED, {})
  }

  async request(data: Messaging.Chain.Request, callback?: Callback) {
    try {
      const response = await messengers.background.send<
        any,
        Messaging.Chain.Response
      >(
        'providerRequest',
        {
          type: this.providerType,
          message: data,
        },
        { id: uuidv4() }
      )

      const result = processBackgroundResponse(
        data,
        this.providerType,
        response
      )

      if (callback) callback(null, result)
      return result
    } catch (error) {
      if (callback) callback(error as Error)
      throw error
    }
  }
}
