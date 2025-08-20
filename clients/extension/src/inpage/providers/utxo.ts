import { UtxoChain } from '@core/chain/Chain'
import { callBackground } from '@core/inpage-provider/background'
import { attempt, withFallback } from '@lib/utils/attempt'
import EventEmitter from 'events'
import { v4 as uuidv4 } from 'uuid'

import { EventMethod, MessageKey, RequestMethod } from '../../utils/constants'
import { processBackgroundResponse } from '../../utils/functions'
import { Messaging } from '../../utils/interfaces'
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
  constructor(providerType: string, chain: SupportedUtxoChain) {
    super()
    this.providerType = providerType as MessageKey
    this.chain = chain
  }

  static getInstance(providerType: string, chain: SupportedUtxoChain): UTXO {
    if (!UTXO.instances) {
      UTXO.instances = new Map<string, UTXO>()
    }

    if (!UTXO.instances.has(providerType)) {
      UTXO.instances.set(providerType, new UTXO(providerType, chain))
    }
    return UTXO.instances.get(providerType)!
  }

  async requestAccounts() {
    return await this.request({
      method: RequestMethod.VULTISIG.REQUEST_ACCOUNTS,
      params: [],
    })
  }

  async getAccounts() {
    return withFallback(
      attempt(async () => [
        await callBackground({
          getAddress: { chain: this.chain },
        }),
      ]),
      []
    )
  }

  async signPSBT(_psbt: string | Buffer) {
    return await this.request({
      method: RequestMethod.CTRL.SIGN_PSBT,
      params: [],
    })
  }

  emitAccountsChanged() {
    this.emit(EventMethod.ACCOUNTS_CHANGED, {})
  }

  async request(data: Messaging.Chain.Request) {
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

    const result = processBackgroundResponse(data, this.providerType, response)

    return result
  }
}
