import { RequestMethod } from '@clients/extension/src/utils/constants'
import { Chain, CosmosChain } from '@core/chain/Chain'
import { getCosmosChainByChainId } from '@core/chain/chains/cosmos/chainInfo'
import { callBackground } from '@core/inpage-provider/background'
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
import { hexToBytes } from '@lib/utils/hexToBytes'
import { areLowerCaseEqual } from '@lib/utils/string/areLowerCaseEqual'
import { AuthInfo, TxBody, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import Long from 'long'

import { EIP1193Error } from '../../background/handlers/errorHandler'
import { ITransaction } from '../../utils/interfaces'
import { requestAccount } from './core/requestAccount'
import { Cosmos } from './cosmos'

const getAccounts = async (chainId: string): Promise<AccountData[]> => {
  const { publicKey, address } = await requestAccount(
    shouldBePresent(getCosmosChainByChainId(chainId))
  )

  return [
    {
      algo: 'secp256k1',
      address,
      pubkey: hexToBytes(publicKey),
    },
  ]
}

class SimpleMutex {
  private queue = Promise.resolve()

  async runExclusive<T>(fn: () => Promise<T>): Promise<T> {
    let release: () => void
    const p = new Promise<void>(res => (release = res))

    const result = this.queue.then(() => fn()).finally(() => release!())

    this.queue = p

    return result
  }
}
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
  mutex = new SimpleMutex()
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

  private async runWithChain<T>(
    chainId: string,
    fn: () => Promise<T>
  ): Promise<T> {
    return this.mutex.runExclusive(async () => {
      const selectedChainId = await callBackground({
        getAppChainId: { chainKind: 'cosmos' },
      })

      if (selectedChainId !== chainId) {
        const chain = getCosmosChainByChainId(chainId)
        if (!chain) {
          throw new EIP1193Error('UnrecognizedChain')
        }

        await callBackground({
          setAppChain: { cosmos: chain },
        })
      }

      return fn()
    })
  }

  async enable(_chainIds: string | string[]): Promise<void> {
    await requestAccount(Chain.Cosmos)
  }

  getOfflineSigner(
    chainId: string,
    _signOptions?: KeplrSignOptions
  ): OfflineAminoSigner & OfflineDirectSigner {
    const cosmSigner = new CosmJSOfflineSigner(chainId, this, _signOptions)

    cosmSigner.getAccounts = async (): Promise<AccountData[]> => {
      const { publicKey, address } = await requestAccount(
        shouldBePresent(getCosmosChainByChainId(chainId))
      )

      return [
        {
          algo: 'secp256k1',
          address,
          pubkey: hexToBytes(publicKey),
        },
      ]
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
      return this.runWithChain(chainId, async () => {
        return getAccounts(chainId)
      })
    }

    return cosmSigner as OfflineAminoSigner
  }

  async sendTx(
    chainId: string,
    tx: StdTx | Uint8Array,
    _mode: BroadcastMode
  ): Promise<Uint8Array> {
    return this.runWithChain(chainId, async () => {
      const result = (await this.cosmosProvider.request({
        method: RequestMethod.VULTISIG.SEND_TRANSACTION,
        params: [{ ...tx, txType: 'Keplr' }],
      })) as ITransaction<CosmosChain>
      const parsed = JSON.parse(result.serialized)

      return new Uint8Array(Buffer.from(parsed.tx_bytes, 'base64'))
    })
  }
  async sendMessage() {}

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    _signOptions?: KeplrSignOptions
  ): Promise<AminoSignResponse> {
    return this.runWithChain(chainId, async () => {
      const [account] = await getAccounts(chainId)
      if (!areLowerCaseEqual(signer, account.address)) {
        throw new Error('Signer does not match current account address')
      }
      const result = (await this.cosmosProvider.request({
        method: RequestMethod.VULTISIG.SEND_TRANSACTION,
        params: [{ ...signDoc, skipBroadcast: true, txType: 'Keplr' }],
      })) as ITransaction<CosmosChain>

      const parsed = JSON.parse(result.serialized)
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

      const stdSignDoc: StdSignDoc = {
        chain_id: chainId,
        account_number: signDoc.account_number.toString(),
        sequence: sequence,
        fee,
        msgs,
        memo,
      }
      const publicKey = Buffer.from(new Uint8Array(account.pubkey)).toString(
        'base64'
      )
      return {
        signed: stdSignDoc,
        signature: {
          pub_key: {
            type: 'tendermint/PubKeySecp256k1',
            value: publicKey,
          },
          signature: shouldBePresent(
            Buffer.from(txRaw.signatures[0]).toString('base64')
          ),
        },
      }
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
    return this.runWithChain(chainId, async () => {
      const [account] = await getAccounts(chainId)
      if (!areLowerCaseEqual(signer, account.address)) {
        throw new Error('Signer does not match current account address')
      }
      const result = (await this.cosmosProvider.request({
        method: RequestMethod.VULTISIG.SEND_TRANSACTION,
        params: [
          {
            bodyBytes: Buffer.from(signDoc.bodyBytes).toString('base64'),
            authInfoBytes: Buffer.from(signDoc.authInfoBytes).toString(
              'base64'
            ),
            chainId: signDoc.chainId,
            accountNumber: signDoc.accountNumber.toString(),
            skipBroadcast: true,
            txType: 'Keplr',
          },
        ],
      })) as ITransaction<CosmosChain>
      const publicKey = Buffer.from(new Uint8Array(account.pubkey)).toString(
        'base64'
      )
      const parsed = JSON.parse(result.serialized)
      const txRaw = TxRaw.decode(Buffer.from(parsed.tx_bytes, 'base64'))

      const generatedSignDoc: KeplrSignDoc = {
        bodyBytes: txRaw.bodyBytes,
        authInfoBytes: txRaw.authInfoBytes,
        chainId: chainId,
        accountNumber: Long.fromString(signDoc.accountNumber.toString()),
      }

      return {
        signed: generatedSignDoc,
        signature: {
          pub_key: {
            type: 'tendermint/PubKeySecp256k1',
            value: publicKey,
          },
          signature: shouldBePresent(
            Buffer.from(txRaw.signatures[0]).toString('base64')
          ),
        },
      }
    })
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
    const [{ pubkey, address, algo }] = await getAccounts(chainId)

    return {
      pubKey: pubkey,
      bech32Address: address,
      ethereumHexAddress: address,
      address: hexToBytes(address),
      isNanoLedger: false,
      isKeystone: false,
      name: '',
      algo,
    }
  }
}
