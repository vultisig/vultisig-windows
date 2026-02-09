import { base64 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { Chain } from '@core/chain/Chain'
import { getCosmosChainByChainId } from '@core/chain/chains/cosmos/chainInfo'
import { CosmosMsgType } from '@core/chain/chains/cosmos/cosmosMsgTypes'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { deserializeSigningOutput } from '@core/chain/tw/signingOutput'
import { callBackground } from '@core/inpage-provider/background'
import { callPopup } from '@core/inpage-provider/popup'
import { TransactionDetails } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import {
  CosmosFee,
  CosmosMsg,
} from '@core/mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
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
import { TxBody, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx'
import Long from 'long'

import { EIP1193Error } from '../../background/handlers/errorHandler'
import { getCosmosChainFromAddress } from '../../utils/cosmos/getCosmosChainFromAddress'
import { requestAccount } from './core/requestAccount'
import { Cosmos } from './cosmos'
import { normalizeCosmosAuthInfoFee } from './cosmos/normalizeAuthInfoFee'

const aminoHandler = (
  signDoc: StdSignDoc,
  chain: Chain
): TransactionDetails => {
  const { msgs, fee, memo } = signDoc
  const [message] = msgs

  return {
    asset: {
      chain: chain,
      ticker: message.value.funds?.[0]?.denom ?? chainFeeCoin[chain].ticker,
    },
    amount: {
      amount: message.value.funds?.[0]?.amount ?? '0',
      decimals: chainFeeCoin[chain].decimals,
    },
    from: message.value.sender ?? message.value.from_address ?? undefined,
    to: message.value.contract ?? message.value.to_address ?? undefined,
    data: memo,
    aminoPayload: {
      msgs: signDoc.msgs as CosmosMsg[],
      fee: fee as CosmosFee,
    },
    skipBroadcast: true,
  } as TransactionDetails
}

const directHandler = (
  signDoc: {
    bodyBytes: string // base64 encoded
    authInfoBytes: string // base64 encoded
    chainId: string
    accountNumber: string
  },
  chain: Chain
): TransactionDetails => {
  const txBody = TxBody.decode(base64.decode(signDoc.bodyBytes))
  const [message] = txBody.messages
  const memo = txBody.memo

  const handleMsgSendUrl = () => {
    const decodedMessage = MsgSend.decode(message.value)
    return {
      asset: {
        chain: chain,
        ticker: decodedMessage.amount[0]?.denom ?? chainFeeCoin[chain].ticker,
      },
      amount: {
        amount: decodedMessage.amount[0]?.amount ?? '0',
        decimals: chainFeeCoin[chain].decimals,
      },
      from: decodedMessage.fromAddress,
      to: decodedMessage.toAddress,
      data: memo,
    }
  }

  const handleMsgExecuteContractUrl = () => {
    const decodedMessage = MsgExecuteContract.decode(message.value)
    return {
      asset: {
        chain: chain,
        ticker:
          decodedMessage.funds.length > 0
            ? decodedMessage.funds[0].denom
            : chainFeeCoin[chain].ticker,
      },
      amount: {
        amount:
          decodedMessage.funds.length > 0
            ? decodedMessage.funds[0].amount
            : '0',
        decimals: chainFeeCoin[chain].decimals,
      },
      from: decodedMessage.sender,
      to: decodedMessage.contract,
      data: memo,
    }
  }

  const handleMsgTransferUrl = () => {
    const txChain = getCosmosChainByChainId(signDoc.chainId)

    if (!txChain) {
      throw new Error(`Chain not supported: ${signDoc.chainId}`)
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
    }
  }

  const handleThorchainDepositUrl = () => {
    const decodedMessage = TW.Cosmos.Proto.Message.THORChainDeposit.decode(
      message.value
    )
    if (
      !decodedMessage.coins ||
      decodedMessage.coins.length === 0 ||
      !decodedMessage.coins[0].asset
    ) {
      throw new Error('coins array is required and cannot be empty')
    }
    const prefix = chain === Chain.MayaChain ? 'maya' : 'thor'
    const signerAddress = bech32.encode(
      prefix,
      bech32.toWords(decodedMessage.signer)
    )

    return {
      asset: {
        chain: chain,
        ticker: decodedMessage.coins[0].asset
          ? decodedMessage.coins[0].asset.chain +
            (decodedMessage.coins[0].asset.secured ? '-' : '.') +
            decodedMessage.coins[0].asset.symbol
          : '',
      },
      amount: {
        amount: decodedMessage.coins[0].amount,
        decimals: chainFeeCoin[chain].decimals,
      },
      from: signerAddress,
      data: memo,
    }
  }

  const handleThorchainSendUrl = () => {
    const decodedMessage = TW.Cosmos.Proto.Message.THORChainSend.decode(
      message.value
    )
    if (
      !decodedMessage.amounts ||
      decodedMessage.amounts.length === 0 ||
      !decodedMessage.amounts[0].denom
    ) {
      throw new Error('amounts array is required and cannot be empty')
    }

    const prefix = chain === Chain.MayaChain ? 'maya' : 'thor'

    const fromAddress = bech32.encode(
      prefix,
      bech32.toWords(decodedMessage.fromAddress)
    )

    const toAddress = bech32.encode(
      prefix,
      bech32.toWords(decodedMessage.toAddress)
    )

    return {
      asset: {
        chain: chain,
        ticker: decodedMessage.amounts[0].denom,
      },
      amount: {
        amount: decodedMessage.amounts[0].amount,
        decimals: chainFeeCoin[chain].decimals,
      },
      from: fromAddress,
      to: toAddress,
      data: memo,
    }
  }

  let transactionInfo: any

  try {
    transactionInfo = match(message.typeUrl, {
      [CosmosMsgType.MSG_SEND]: handleMsgSendUrl,
      [CosmosMsgType.THORCHAIN_MSG_SEND]: handleMsgSendUrl,
      [CosmosMsgType.MSG_SEND_URL]: handleMsgSendUrl,
      [CosmosMsgType.MSG_EXECUTE_CONTRACT]: handleMsgExecuteContractUrl,
      [CosmosMsgType.MSG_EXECUTE_CONTRACT_URL]: handleMsgExecuteContractUrl,
      [CosmosMsgType.MSG_TRANSFER_URL]: handleMsgTransferUrl,
      [CosmosMsgType.THORCHAIN_MSG_DEPOSIT]: handleThorchainDepositUrl,
      [CosmosMsgType.THORCHAIN_MSG_DEPOSIT_URL]: handleThorchainDepositUrl,
      [CosmosMsgType.THORCHAIN_MSG_SEND_URL]: handleThorchainSendUrl,
    })
  } catch {
    transactionInfo = {
      asset: { chain, ticker: chainFeeCoin[chain].ticker },
      amount: { amount: '0', decimals: chainFeeCoin[chain].decimals },
      data: memo,
    }
  }

  return {
    ...transactionInfo,
    directPayload: {
      bodyBytes: signDoc.bodyBytes,
      authInfoBytes: signDoc.authInfoBytes,
      chainId: signDoc.chainId,
      accountNumber: signDoc.accountNumber,
    },
    skipBroadcast: true,
  } as TransactionDetails
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

    await Promise.all(chains.map(chain => requestAccount(chain)))
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

      const transactionDetails = aminoHandler(signDoc, chain)

      const [{ data }] = await callPopup(
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

      const output = deserializeSigningOutput(chain, data)

      const aminoJson = JSON.parse(output.json)
      const stdTx = aminoJson.tx as {
        msg: AminoMsg[]
        fee: StdFee
        memo: string
        signatures: Array<{
          pub_key: { type: string; value: string }
          signature: string
        }>
      }

      if (!stdTx.signatures || stdTx.signatures.length === 0) {
        throw new Error('Amino JSON transaction missing signatures')
      }

      const [signature] = stdTx.signatures

      if (!signature.pub_key) {
        throw new Error('Amino JSON signature missing pub_key')
      }

      const signed: StdSignDoc = {
        chain_id: signDoc.chain_id,
        account_number: signDoc.account_number,
        sequence: signDoc.sequence,
        msgs: stdTx.msg,
        fee: stdTx.fee,
        memo: stdTx.memo,
      }

      return {
        signed,
        signature: {
          pub_key: {
            type: signature.pub_key.type,
            value: signature.pub_key.value,
          },
          signature: signature.signature,
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

      const normalizedAuthInfoBytes = normalizeCosmosAuthInfoFee(
        new Uint8Array(signDoc.authInfoBytes),
        chain
      )
      const transactionDetails: TransactionDetails = directHandler(
        {
          bodyBytes: Buffer.from(signDoc.bodyBytes).toString('base64'),
          authInfoBytes: Buffer.from(normalizedAuthInfoBytes).toString(
            'base64'
          ),
          chainId: signDoc.chainId,
          accountNumber: signDoc.accountNumber.toString(),
        },
        chain
      )

      const [{ data }] = await callPopup(
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

    const vault = await callBackground({
      exportVault: {},
    })

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
      name: vault.name,
      algo,
    }
  }
}
