import { RequestMethod } from '@clients/extension/src/utils/constants'
import { Messaging } from '@clients/extension/src/utils/interfaces'
import { CosmosChain } from '@core/chain/Chain'
import { getCosmosAccountInfo } from '@core/chain/chains/cosmos/account/getCosmosAccountInfo'
import { getCosmosChainByChainId } from '@core/chain/chains/cosmos/chainInfo'
import { TxResult } from '@core/chain/tx/execute/ExecuteTxResolver'
import { AminoMsg, StdFee } from '@cosmjs/amino'
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
import { SignDoc as KeplrSignDoc } from '@keplr-wallet/types/build/cosmjs'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { AuthInfo, TxBody, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
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
      this,
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

  async sendTx(
    _chainId: string,
    _tx: StdTx | Uint8Array,
    _mode: BroadcastMode
  ): Promise<Uint8Array> {
    const result = (await this.cosmosProvider.request({
      method: RequestMethod.VULTISIG.SEND_TRANSACTION,
      params: [{ ..._tx, txType: 'Keplr' }],
    })) as TxResult
    const parsed = JSON.parse(shouldBePresent(result.encoded))

    return new Uint8Array(Buffer.from(parsed.tx_bytes, 'base64'))
  }
  async sendMessage() {}

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    _signOptions?: KeplrSignOptions
  ): Promise<AminoSignResponse> {
    const result = (await this.cosmosProvider.request({
      method: RequestMethod.VULTISIG.SEND_TRANSACTION,
      params: [{ ...signDoc, skipBroadcast: true, txType: 'Keplr' }],
    })) as TxResult
    const txChain = getCosmosChainByChainId(chainId)

    if (!txChain) {
      throw new Error(`Chain not supported: ${chainId}`)
    }
    const parsed = JSON.parse(shouldBePresent(result.encoded))
    const txRaw = TxRaw.decode(Buffer.from(parsed.tx_bytes, 'base64'))
    const txBody = TxBody.decode(txRaw.bodyBytes)
    const authInfo = AuthInfo.decode(txRaw.authInfoBytes)
    const msgs: AminoMsg[] = txBody.messages.map((msg): AminoMsg => {
      try {
        return {
          type: msg.typeUrl,
          value: JSON.parse(Buffer.from(msg.value).toString()),
        }
      } catch (error) {
        throw new Error(
          `Failed to parse message value for ${msg.typeUrl}: ${error}`
        )
      }
    })
    const gasLimit = authInfo.fee?.gasLimit.toString() || '0'
    const feeAmount =
      authInfo.fee?.amount.map(coin => ({
        denom: coin.denom,
        amount: coin.amount,
      })) ?? []

    const fee: StdFee = {
      gas: gasLimit,
      amount: feeAmount,
    }

    const memo = txBody.memo ?? ''

    const sequence = authInfo.signerInfos[0]?.sequence.toString() ?? '0'

    const accountInfo = await getCosmosAccountInfo({
      chain: txChain as CosmosChain,
      address: signer,
    })

    if (!accountInfo || !accountInfo.pubkey || !accountInfo.accountNumber) {
      throw new Error('Missing account info or pubkey/accountNumber')
    }
    const stdSignDoc: StdSignDoc = {
      chain_id: chainId,
      account_number: accountInfo.accountNumber.toString(),
      sequence: sequence,
      fee,
      msgs,
      memo,
    }

    return {
      signed: stdSignDoc,
      signature: {
        pub_key: accountInfo.pubkey,
        signature: shouldBePresent(
          Buffer.from(txRaw.signatures[0]).toString('base64')
        ),
      },
    }
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
    const result = (await this.cosmosProvider.request({
      method: RequestMethod.VULTISIG.SEND_TRANSACTION,
      params: [
        {
          bodyBytes: Buffer.from(signDoc.bodyBytes).toString('base64'),
          authInfoBytes: Buffer.from(signDoc.authInfoBytes).toString('base64'),
          chainId: signDoc.chainId,
          accountNumber: signDoc.accountNumber.toString(),
          skipBroadcast: true,
          txType: 'Keplr',
        },
      ],
    })) as TxResult
    const txChain = getCosmosChainByChainId(chainId)
    const parsed = JSON.parse(shouldBePresent(result.encoded))
    const txRaw = TxRaw.decode(Buffer.from(parsed.tx_bytes, 'base64'))

    const accountInfo = await getCosmosAccountInfo({
      chain: txChain as CosmosChain,
      address: signer,
    })

    if (!accountInfo || !accountInfo.pubkey || !accountInfo.accountNumber) {
      throw new Error('Missing account info or pubkey/accountNumber')
    }
    const generatedSignDoc: KeplrSignDoc = {
      bodyBytes: txRaw.bodyBytes,
      authInfoBytes: txRaw.authInfoBytes,
      chainId: chainId,
      accountNumber: Long.fromString(accountInfo.accountNumber.toString()),
    }

    return {
      signed: generatedSignDoc,
      signature: {
        pub_key: accountInfo.pubkey,
        signature: shouldBePresent(
          Buffer.from(txRaw.signatures[0]).toString('base64')
        ),
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
