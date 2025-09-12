import { base64 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { Chain } from '@core/chain/Chain'
import { getCosmosChainByChainId } from '@core/chain/chains/cosmos/chainInfo'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { deserializeSigningOutput } from '@core/chain/tw/signingOutput'
import { callBackground } from '@core/inpage-provider/background'
import { callPopup } from '@core/inpage-provider/popup'
import {
  CosmosMsgPayload,
  CosmosMsgType,
  TransactionDetails,
} from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { AminoMsg, StdFee } from '@cosmjs/amino'
import {
  CosmJSOfflineSigner,
  CosmJSOfflineSignerOnlyAmino,
  Keplr,
} from '@keplr-wallet/provider'
import {
  AccountData,
  AminoSignResponse,
  DirectSignResponse,
  KeplrMode,
  KeplrSignOptions,
  Key,
  OfflineAminoSigner,
  OfflineDirectSigner,
  StdSignDoc,
} from '@keplr-wallet/types'
import { SignDoc as KeplrSignDoc } from '@keplr-wallet/types/build/cosmjs'
import { without } from '@lib/utils/array/without'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { NotImplementedError } from '@lib/utils/error/NotImplementedError'
import { hexToBytes } from '@lib/utils/hexToBytes'
import { match } from '@lib/utils/match'
import { areLowerCaseEqual } from '@lib/utils/string/areLowerCaseEqual'
import { TW } from '@trustwallet/wallet-core'
import { bech32 } from 'bech32'
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import { AuthInfo, TxBody, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx'
import Long from 'long'

import { EIP1193Error } from '../../background/handlers/errorHandler'
import { getCosmosChainFromAddress } from '../../utils/cosmos/getCosmosChainFromAddress'
import { requestAccount } from './core/requestAccount'
import { Cosmos } from './cosmos'

const formatContractMessage = (msgString: string): string =>
  msgString.replace(/^({)/, '$1 ').replace(/(})$/, ' $1').replace(/:/g, ': ')

type KeplrTransaction = (
  | StdSignDoc
  | {
      bodyBytes: string // base64 encoded
      authInfoBytes: string // base64 encoded
      chainId: string
      accountNumber: string // stringified Long
    }
) & {
  skipBroadcast?: boolean
}

const extractKeplrMessages = (
  tx: KeplrTransaction
): {
  messages: any[]
  memo: string
  chainId: string
  skipBroadcast?: boolean
} => {
  if ('msgs' in tx) {
    return {
      chainId: tx.chain_id,
      messages: [...tx.msgs],
      memo: tx.memo,
      skipBroadcast: tx.skipBroadcast,
    }
  } else {
    const txBody = TxBody.decode(base64.decode(tx.bodyBytes))

    return {
      chainId: tx.chainId,
      messages: txBody.messages,
      memo: txBody.memo,
      skipBroadcast: tx.skipBroadcast,
    }
  }
}

const keplrHandler = (
  tx: KeplrTransaction,
  chain: Chain
): TransactionDetails => {
  const { messages, memo, chainId, skipBroadcast } = extractKeplrMessages(tx)
  const [message] = messages

  const handleMsgSend = () => {
    if (
      !message.value ||
      !message.value.amount ||
      message.value.amount.length === 0
    ) {
      throw new Error('Invalid message structure: missing or empty amount')
    }
    return {
      asset: {
        chain: chain,
        ticker: message.value.amount[0].denom,
      },
      amount: {
        amount: message.value.amount[0].amount,
        decimals: chainFeeCoin[chain].decimals,
      },
      from: message.value.from_address,
      to: message.value.to_address,
      data: memo,
      cosmosMsgPayload: {
        case: message.type,
        value: {
          amount: message.value.amount,
          from_address: message.value.from_address,
          to_address: message.value.to_address,
        },
      } as CosmosMsgPayload,
      skipBroadcast,
    }
  }

  const handleMsgSendUrl = () => {
    const decodedMessage = MsgSend.decode(message.value)
    return {
      asset: {
        chain: chain,
        ticker: decodedMessage.amount[0].denom,
      },
      amount: {
        amount: decodedMessage.amount[0].amount,
        decimals: chainFeeCoin[chain].decimals,
      },
      from: decodedMessage.fromAddress,
      to: decodedMessage.toAddress,
      data: memo,
      cosmosMsgPayload: {
        case: message.typeUrl,
        value: {
          amount: decodedMessage.amount,
          from_address: decodedMessage.fromAddress,
          to_address: decodedMessage.toAddress,
        },
      } as CosmosMsgPayload,
      skipBroadcast,
    }
  }
  return match(message.type ?? message.typeUrl, {
    [CosmosMsgType.MSG_SEND]: handleMsgSend,
    [CosmosMsgType.THORCHAIN_MSG_SEND]: handleMsgSend,
    [CosmosMsgType.MSG_SEND_URL]: handleMsgSendUrl,
    [CosmosMsgType.MSG_EXECUTE_CONTRACT]: () => {
      const formattedMessage = formatContractMessage(
        JSON.stringify(message.value.msg)
      )

      return {
        asset: {
          chain: chain,
          ticker: message.value.funds.length
            ? message.value!.funds[0].denom
            : chainFeeCoin[chain].ticker,
        },
        amount: {
          amount: message.value.funds.length
            ? message.value.funds[0].amount
            : 0,
          decimals: chainFeeCoin[chain].decimals,
        },
        from: message.value.sender,
        to: message.value.contract,
        data: memo,
        cosmosMsgPayload: {
          case: CosmosMsgType.MSG_EXECUTE_CONTRACT,
          value: {
            sender: message.value.sender,
            contract: message.value.contract,
            funds: message.value.funds,
            msg: formattedMessage,
          },
        } as CosmosMsgPayload,
        skipBroadcast,
      }
    },
    [CosmosMsgType.MSG_EXECUTE_CONTRACT_URL]: () => {
      const decodedMessage = MsgExecuteContract.decode(message.value)
      const msgString = new TextDecoder().decode(
        Buffer.from(decodedMessage.msg)
      )
      const formattedMessage = formatContractMessage(msgString)
      return {
        asset: {
          chain: chain,
          ticker: decodedMessage.funds.length
            ? decodedMessage.funds[0].denom
            : chainFeeCoin[chain].ticker,
        },
        amount: {
          amount: decodedMessage.funds.length
            ? decodedMessage.funds[0].amount
            : 0,
          decimals: chainFeeCoin[chain].decimals,
        },
        from: decodedMessage.sender,
        to: decodedMessage.contract,
        data: memo,
        cosmosMsgPayload: {
          case: CosmosMsgType.MSG_EXECUTE_CONTRACT,
          value: {
            sender: decodedMessage.sender,
            contract: decodedMessage.contract,
            funds: decodedMessage.funds,
            msg: formattedMessage,
          },
        } as CosmosMsgPayload,
        skipBroadcast,
      }
    },
    [CosmosMsgType.MSG_TRANSFER_URL]: () => {
      const txChain = getCosmosChainByChainId(chainId)

      if (!txChain) {
        throw new Error(`Chain not supported: ${chainId}`)
      }

      const msg = MsgTransfer.decode(message.value)

      const receiverChain = getCosmosChainFromAddress(msg.receiver)

      return {
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
        cosmosMsgPayload: {
          case: CosmosMsgType.MSG_TRANSFER_URL,
          value: {
            ...msg,
            timeoutHeight: {
              revisionHeight: msg.timeoutHeight.revisionHeight.toString(),
              revisionNumber: msg.timeoutHeight.revisionNumber.toString(),
            },
            timeoutTimestamp: msg.timeoutTimestamp.toString(),
          },
        } as CosmosMsgPayload,
        skipBroadcast,
      }
    },
    [CosmosMsgType.THORCHAIN_MSG_DEPOSIT]: () => {
      if (!message.value.coins || message.value.coins.length === 0) {
        throw new Error(' coins array is required and cannot be empty')
      }

      const assetParts = message.value.coins[0].asset.split('.')
      if (assetParts.length < 2) {
        throw new Error(`invalid asset format: ${message.value.coins[0].asset}`)
      }
      return {
        asset: {
          chain: chain,
          ticker: assetParts[1],
        },
        amount: {
          amount: message.value.coins[0].amount,
          decimals: chainFeeCoin[chain].decimals,
        },
        from: message.value.signer,
        data: memo,
        cosmosMsgPayload: {
          case: CosmosMsgType.THORCHAIN_MSG_DEPOSIT,
          value: {
            coins: message.value.coins,
            memo: message.value.memo,
            signer: message.value.signer,
          },
        } as CosmosMsgPayload,
        skipBroadcast,
      }
    },
    [CosmosMsgType.THORCHAIN_MSG_DEPOSIT_URL]: () => {
      const decodedMessage = TW.Cosmos.Proto.Message.THORChainDeposit.decode(
        message.value
      )
      if (
        !decodedMessage.coins ||
        decodedMessage.coins.length === 0 ||
        !decodedMessage.coins[0].asset
      ) {
        throw new Error(' coins array is required and cannot be empty')
      }
      const thorAddress = bech32.encode(
        'thor',
        bech32.toWords(decodedMessage.signer)
      )

      return {
        asset: {
          chain: chain,
          ticker: decodedMessage.coins[0].asset.ticker,
        },
        amount: {
          amount: decodedMessage.coins[0].amount,
          decimals: chainFeeCoin[chain].decimals,
        },
        from: thorAddress,
        data: memo,
        cosmosMsgPayload: {
          case: CosmosMsgType.THORCHAIN_MSG_DEPOSIT,
          value: {
            coins: decodedMessage.coins.map(coin => ({
              amount: coin.amount,
              asset: coin.asset?.ticker,
            })),
            memo: decodedMessage.memo,
            signer: thorAddress,
          },
        } as CosmosMsgPayload,
        skipBroadcast,
      }
    },
  })
}

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
    const chains = without(
      (Array.isArray(_chainIds) ? _chainIds : [_chainIds]).map(
        getCosmosChainByChainId
      ),
      undefined
    )

    await Promise.all(
      chains.map(chain =>
        callBackground({
          getAccount: {
            chain,
          },
        })
      )
    )
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

  async sendTx(): Promise<Uint8Array> {
    // This method accepts a transaction of type StdTx | Uint8Array; however, the previous implementation did not support handling this type.
    throw new NotImplementedError('Keplr sendTx method')
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

      const chain = shouldBePresent(getCosmosChainByChainId(chainId))

      const transactionDetails = keplrHandler(signDoc, chain)

      const { data } = await callPopup(
        {
          sendTx: {
            keysign: {
              transactionDetails,
              chain,
            },
          },
        },
        { account: transactionDetails.from }
      )

      const { serialized } = deserializeSigningOutput(chain, data)

      const parsed = JSON.parse(serialized)
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

      const chain = shouldBePresent(getCosmosChainByChainId(chainId))

      const transactionDetails = keplrHandler(
        {
          bodyBytes: Buffer.from(signDoc.bodyBytes).toString('base64'),
          authInfoBytes: Buffer.from(signDoc.authInfoBytes).toString('base64'),
          chainId: signDoc.chainId,
          accountNumber: signDoc.accountNumber.toString(),
          skipBroadcast: true,
        },
        chain
      )

      const { data } = await callPopup(
        {
          sendTx: {
            keysign: {
              transactionDetails,
              chain,
            },
          },
        },
        { account: transactionDetails.from }
      )

      const { serialized } = deserializeSigningOutput(chain, data)
      const publicKey = Buffer.from(new Uint8Array(account.pubkey)).toString(
        'base64'
      )
      const parsed = JSON.parse(serialized)
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

    const addressBytes = new Uint8Array(
      bech32.fromWords(bech32.decode(address).words)
    )

    return {
      pubKey: pubkey,
      bech32Address: address,
      ethereumHexAddress: address,
      address: addressBytes,
      isNanoLedger: false,
      isKeystone: false,
      name: '',
      algo,
    }
  }
}
