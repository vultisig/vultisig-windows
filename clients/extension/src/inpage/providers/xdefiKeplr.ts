import { RequestMethod } from '@clients/extension/src/utils/constants'
import { getCosmosChainFromAddress } from '@clients/extension/src/utils/cosmos/getCosmosChainFromAddress'
import {
  Messaging,
  TransactionDetails,
} from '@clients/extension/src/utils/interfaces'
import { CosmosChain } from '@core/chain/Chain'
import { getCosmosAccountInfo } from '@core/chain/chains/cosmos/account/getCosmosAccountInfo'
import { getCosmosChainByChainId } from '@core/chain/chains/cosmos/chainInfo'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { TxResult } from '@core/chain/tx/execute/ExecuteTxResolver'
import {
  CosmJSOfflineSigner,
  CosmJSOfflineSignerOnlyAmino,
  Keplr,
} from '@keplr-wallet/provider'
import {
  AccountData,
  AminoSignResponse,
  BroadcastMode,
  DirectSignResponse,
  KeplrMode,
  KeplrSignOptions,
  Key,
  OfflineAminoSigner,
  OfflineDirectSigner,
  StdSignDoc,
  StdTx,
} from '@keplr-wallet/types'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import base58 from 'bs58'
import { TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx'
import Long from 'long'

import { Cosmos } from './cosmos'

class XDEFIMessageRequester {
  constructor() {
    this.sendMessage = this.sendMessage.bind(this)
  }
  // Expected for Ctrl
  public async sendMessage(_message: any, _params: any): Promise<void> {
    return new Promise(resolve => {
      resolve()
    })
  }
}

export class XDEFIKeplrProvider extends Keplr {
  static instance: XDEFIKeplrProvider | null = null
  isXDEFI: boolean
  isVulticonnect: boolean
  cosmosProvider: Cosmos
  public static getInstance(cosmosProvider: Cosmos): XDEFIKeplrProvider {
    if (!XDEFIKeplrProvider.instance) {
      XDEFIKeplrProvider.instance = new XDEFIKeplrProvider(
        '0.0.1',
        'extension',
        new XDEFIMessageRequester(),
        cosmosProvider
      )
    }
    return XDEFIKeplrProvider.instance
  }

  emitAccountsChanged(): void {
    window.dispatchEvent(new Event('keplr_keystorechange'))
  }

  constructor(
    version: string,
    mode: KeplrMode,
    requester: any,
    cosmosProvider: Cosmos
  ) {
    super(version, mode, requester)
    this.isXDEFI = true
    this.isVulticonnect = true
    window.ctrlKeplrProviders = {}
    window.ctrlKeplrProviders['Ctrl Wallet'] = this
    this.cosmosProvider = cosmosProvider
  }
  enable(_chainIds: string | string[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.cosmosProvider
        .request({
          method: RequestMethod.VULTISIG.REQUEST_ACCOUNTS,
          params: [],
        })
        .then(() => resolve())
        .catch(reject)
    })
  }
  getOfflineSigner(
    chainId: string,
    _signOptions?: KeplrSignOptions
  ): OfflineAminoSigner & OfflineDirectSigner {
    const cosmSigner = new CosmJSOfflineSigner(chainId, this, _signOptions)

    cosmSigner.getAccounts = async (): Promise<AccountData[]> => {
      const currentChainID = await this.cosmosProvider.request({
        method: RequestMethod.VULTISIG.CHAIN_ID,
        params: [],
      })

      if (currentChainID !== chainId) {
        await this.cosmosProvider.request({
          method: RequestMethod.VULTISIG.WALLET_SWITCH_CHAIN,
          params: [{ chainId }],
        })
      }

      const accounts = await this.cosmosProvider.request({
        method: RequestMethod.VULTISIG.REQUEST_ACCOUNTS,
        params: [],
      })

      return accounts as unknown as AccountData[]
    }

    return cosmSigner as OfflineAminoSigner & OfflineDirectSigner
  }

  getOfflineSignerOnlyAmino(
    chainId: string,
    signOptions?: KeplrSignOptions
  ): OfflineAminoSigner {
    const cosmSigner = new CosmJSOfflineSignerOnlyAmino(
      chainId,
      window.xfi.keplr,
      signOptions
    )

    cosmSigner.getAccounts = async (): Promise<AccountData[]> => {
      const currentChainID = await this.cosmosProvider.request({
        method: RequestMethod.VULTISIG.CHAIN_ID,
        params: [],
      })

      if (currentChainID !== chainId) {
        await this.cosmosProvider.request({
          method: RequestMethod.VULTISIG.WALLET_SWITCH_CHAIN,
          params: [{ chainId }],
        })
      }

      const accounts = await this.cosmosProvider.request({
        method: RequestMethod.VULTISIG.REQUEST_ACCOUNTS,
        params: [],
      })

      return accounts as unknown as AccountData[]
    }

    return cosmSigner as OfflineAminoSigner
  }

  sendTx(
    _chainId: string,
    _tx: StdTx | Uint8Array,
    _mode: BroadcastMode
  ): Promise<Uint8Array> {
    return new Promise<Uint8Array>((resolve, reject) => {
      this.cosmosProvider
        .request({
          method: RequestMethod.VULTISIG.SEND_TRANSACTION,
          params: [{ ..._tx, txType: 'Keplr' }],
        })
        .then(result => {
          const decoded = base58.decode(
            shouldBePresent((result as TxResult).encoded)
          )
          if (decoded) resolve(decoded)
          else reject()
        })
        .catch(reject)
    })
  }
  async sendMessage() {}

  signAmino(
    _chainId: string,
    _signer: string,
    signDoc: StdSignDoc,
    _signOptions?: KeplrSignOptions
  ): Promise<AminoSignResponse> {
    return new Promise<AminoSignResponse>((resolve, reject) => {
      this.cosmosProvider
        .request({
          method: RequestMethod.VULTISIG.SEND_TRANSACTION,
          params: [{ ...signDoc, txType: 'Keplr' }],
        })
        .then(result => {
          resolve(result as any)
        })
        .catch(reject)
    })
  }
  async signDirect(
    chainId: string,
    signer: string,
    signDoc: {
      bodyBytes: Uint8Array
      authInfoBytes: Uint8Array
      chainId: string
      accountNumber: Long
    },
    _signOptions: KeplrSignOptions
  ): Promise<DirectSignResponse> {
    const txBody = TxBody.decode(signDoc.bodyBytes)

    const [firstMessage] = txBody.messages
    if (
      !firstMessage ||
      firstMessage.typeUrl !== '/ibc.applications.transfer.v1.MsgTransfer'
    ) {
      throw new Error('Unsupported message type')
    }

    const txChain = getCosmosChainByChainId(chainId)

    if (!txChain) {
      throw new Error(`Chain not supported: ${chainId}`)
    }

    const msg = MsgTransfer.decode(firstMessage.value)
    const receiverChain = getCosmosChainFromAddress(msg.receiver)
    if (!receiverChain) {
      throw new Error(`Receiver chain not supported: ${msg.receiver}`)
    }

    const standardTx: TransactionDetails = {
      asset: {
        chain: txChain,
        ticker: msg.token.denom,
      },
      amount: {
        amount: msg.token.amount,
        decimals: chainFeeCoin[txChain].decimals,
      },
      from: msg.sender,
      to: msg.receiver,
      data: `${receiverChain}:${msg.sourceChannel}:${msg.receiver}:${msg.memo}`,
      ibcTransaction: {
        ...msg,
        timeoutHeight: {
          revisionHeight: msg.timeoutHeight.revisionHeight.toString(),
          revisionNumber: msg.timeoutHeight.revisionNumber.toString(),
        },
        timeoutTimestamp: msg.timeoutTimestamp.toString(),
      },
    }

    const result = (await this.cosmosProvider.request({
      method: RequestMethod.VULTISIG.SEND_TRANSACTION,
      params: [{ ...standardTx, txType: 'Vultisig' }],
    })) as TxResult

    const accountInfo = await getCosmosAccountInfo({
      chain: txChain as CosmosChain,
      address: signer,
    })

    if (!accountInfo || !accountInfo.pubkey) {
      throw new Error('No account info or pubkey')
    }

    const decoded = base58.decode(shouldBePresent(result.encoded))
    if (!decoded) {
      throw new Error('Invalid signature')
    }

    return {
      signed: signDoc,
      signature: {
        pub_key: accountInfo.pubkey,
        signature: decoded.toString(),
      },
    }
  }
  async experimentalSuggestChain(_chainInfo: any) {
    return
  }
  async sendSimpleMessage(
    _type: string,
    _method: string,
    _payload: any
  ): Promise<any> {
    return
  }

  async getKey(chainId: string): Promise<Key> {
    const accounts = (await this.ensureChainAndGetAccounts(chainId)) as any[]

    const transformedAccounts = accounts.map((account: any) => ({
      ...account,
      pubKey: account.pubkey,
    }))

    return transformedAccounts[0]
  }
  private async ensureChainAndGetAccounts(
    chainId: string
  ): Promise<Messaging.Chain.Response> {
    const currentChainID = await this.cosmosProvider.request({
      method: RequestMethod.VULTISIG.CHAIN_ID,
      params: [],
    })

    if (currentChainID !== chainId) {
      await this.cosmosProvider.request({
        method: RequestMethod.VULTISIG.WALLET_SWITCH_CHAIN,
        params: [{ chainId }],
      })
    }

    return this.cosmosProvider.request({
      method: RequestMethod.VULTISIG.REQUEST_ACCOUNTS,
      params: [],
    })
  }
}
