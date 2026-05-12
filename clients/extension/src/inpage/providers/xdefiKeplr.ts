import { callBackground } from '@core/inpage-provider/background'
import { callPopup } from '@core/inpage-provider/popup'
import { PopupError } from '@core/inpage-provider/popup/error'
import { TransactionDetails } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { AminoMsg, StdFee } from '@cosmjs/amino'
import {
  CosmJSOfflineSigner,
  CosmJSOfflineSignerOnlyAmino,
  Keplr,
} from '@keplr-wallet/provider'
import {
  AccountData,
  AminoSignResponse,
  ChainInfo,
  ChainInfoWithoutEndpoints,
  DirectSignResponse,
  KeplrMode,
  KeplrSignOptions,
  Key,
  OfflineAminoSigner,
  OfflineDirectSigner,
  StdSignDoc,
} from '@keplr-wallet/types'
import { SignDoc as KeplrSignDoc } from '@keplr-wallet/types/build/cosmjs'
import { TW } from '@trustwallet/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { getCosmosChainByChainId } from '@vultisig/core-chain/chains/cosmos/chainInfo'
import { CosmosMsgType } from '@vultisig/core-chain/chains/cosmos/cosmosMsgTypes'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { deserializeSigningOutput } from '@vultisig/core-chain/tw/signingOutput'
import {
  CosmosFee,
  CosmosMsg,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { attempt } from '@vultisig/lib-utils/attempt'
import { NotImplementedError } from '@vultisig/lib-utils/error/NotImplementedError'
import { hexToBytes } from '@vultisig/lib-utils/hexToBytes'
import { match } from '@vultisig/lib-utils/match'
import { areLowerCaseEqual } from '@vultisig/lib-utils/string/areLowerCaseEqual'
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
import {
  getKeplrCosmosChainInfos,
  isNativeKeplrChainId,
} from './keplrChainInfo'

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
  const txBody = TxBody.decode(Buffer.from(signDoc.bodyBytes, 'base64'))
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

const standardCosmosCoinType = 118

// Signing flows require Vultisig native support for the chain (transaction
// encoding, fee handling, broadcast). Suggested-but-not-native chains can do
// read-only `getKey` via the Cosmos Hub key + bech32-prefix swap, but signing
// has no fallback — surface a Keplr-shaped error so dApps display a clear
// "chain not supported" message instead of our generic assertion throw.
const assertNativeChainForSigning = (chainId: string): void => {
  if (!getCosmosChainByChainId(chainId)) {
    throw new Error(`Chain ${chainId} is not supported for signing`)
  }
}

const getAccounts = async (chainId: string): Promise<AccountData[]> => {
  const nativeChain = getCosmosChainByChainId(chainId)
  if (nativeChain) {
    const { publicKey, address } = await requestAccount(nativeChain)
    return [
      {
        algo: 'secp256k1',
        address,
        pubkey: hexToBytes(publicKey),
      },
    ]
  }

  // Suggested-but-not-native Cosmos chain (dungeon-1, etc.). Standard
  // secp256k1 / coinType-118 chains share their derivation with Cosmos Hub,
  // so we reuse the Hub's pubkey and re-encode the same 20-byte address
  // payload with the suggested chain's bech32 prefix. Non-118 coinTypes
  // (Injective coinType 60, Terra coinType 330, etc.) need a different key
  // derivation we don't support yet — reject with a Keplr-shaped error.
  const suggested = await callBackground({ getKeplrSuggestedChains: {} })
  const info = suggested[chainId]
  if (!info) {
    throw new Error(`There is no chain info for ${chainId}`)
  }
  const prefix = info.bech32Config?.bech32PrefixAccAddr
  if (info.bip44.coinType !== standardCosmosCoinType || !prefix) {
    throw new Error(`There is no chain info for ${chainId}`)
  }

  const { publicKey, address: cosmosAddress } = await requestAccount(
    Chain.Cosmos
  )
  const { words } = bech32.decode(cosmosAddress)
  const address = bech32.encode(prefix, words)

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
// Minimal `experimentalSuggestChain` schema check. Keplr's reference
// implementation validates a long list of fields with bech32 parsing and
// regex constraints — we just enforce the ones cosmos-kit dApps depend on
// (chainId, chainName, rpc/rest, bech32 prefix, at least one currency).
// Anything malformed gets a Keplr-shaped throw so the dApp can surface a
// useful error to the user instead of silently failing later.
const validateSuggestedChainInfo = (info: unknown): void => {
  if (!info || typeof info !== 'object') {
    throw new Error('chainInfo must be an object')
  }
  const ci = info as Partial<ChainInfo>
  const requireString = (key: keyof ChainInfo): void => {
    const value = ci[key]
    if (typeof value !== 'string' || value.length === 0) {
      throw new Error(`chainInfo.${String(key)} must be a non-empty string`)
    }
  }
  requireString('chainId')
  requireString('chainName')
  requireString('rpc')
  requireString('rest')
  if (
    !ci.bech32Config ||
    typeof ci.bech32Config.bech32PrefixAccAddr !== 'string'
  ) {
    throw new Error('chainInfo.bech32Config.bech32PrefixAccAddr is required')
  }
  if (!Array.isArray(ci.currencies) || ci.currencies.length === 0) {
    throw new Error('chainInfo.currencies must be a non-empty array')
  }
  if (!Array.isArray(ci.feeCurrencies) || ci.feeCurrencies.length === 0) {
    throw new Error('chainInfo.feeCurrencies must be a non-empty array')
  }
  if (!ci.bip44 || typeof ci.bip44.coinType !== 'number') {
    throw new Error('chainInfo.bip44.coinType must be a number')
  }
}

// Destructure-and-discard the four endpoint fields — we only expose Cosmos
// chains, so `evm` is always absent at runtime, but ChainInfo's optional
// `evm` is incompatible with `ChainInfoWithoutEndpoints`'s stripped variant
// and TypeScript can't narrow it through a spread.
const stripEndpoints = ({
  rpc: _rpc,
  rest: _rest,
  nodeProvider: _nodeProvider,
  evm: _evm,
  ...rest
}: ChainInfo): ChainInfoWithoutEndpoints => ({
  ...rest,
  rpc: undefined,
  rest: undefined,
  nodeProvider: undefined,
})

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
  // Serializes suggest-chain popups so cosmos-kit dApps that
  // fire `experimentalSuggestChain` for many chains in parallel only see one
  // popup at a time. Combined with the per-chainId `suggestInFlight` map
  // below, duplicate calls for the same chain share a single promise.
  private suggestMutex = new SimpleMutex()
  private suggestInFlight = new Map<string, Promise<void>>()
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
    const requested = Array.isArray(_chainIds) ? _chainIds : [_chainIds]
    if (requested.length === 0) return

    // Keplr's `enable` throws a Keplr-shaped error for chains it doesn't
    // know about — cosmos-kit / graz wallet adapters regex on
    // `"no chain info"` to surface a useful "add this chain" UX. Our
    // previous silent-filter behavior let the dApp think enable succeeded
    // and then exploded inside `getKey` with a non-Keplr-shaped throw.
    //
    // A chain is "known" if it's natively supported OR has been registered
    // via `experimentalSuggestChain`. Suggested-but-not-native chains pass
    // the known check but won't actually grant a vault session (Vultisig
    // can't sign for them yet) — downstream `getKey` will still error.
    const suggested = await callBackground({ getKeplrSuggestedChains: {} })
    const nativeChains: Chain[] = []
    for (const chainId of requested) {
      const chain = getCosmosChainByChainId(chainId)
      if (chain) {
        nativeChains.push(chain)
        continue
      }
      if (!suggested[chainId]) {
        throw new Error(`There is no chain info for ${chainId}`)
      }
    }

    if (nativeChains.length === 0) return

    // Serialize the first chain through `requestAccount` so the
    // grant-vault popup surfaces exactly once. Running every chain
    // through `requestAccount` in parallel raced multiple popups against
    // each other — only one would win, the others returned no
    // `appSession` and the dApp got back `EIP1193Error('InternalError')`.
    // Subsequent chains piggyback on the same dApp authorization via
    // `getAccount`, which is silent (no popup) once the host is granted.
    const [primary, ...rest] = nativeChains
    await requestAccount(primary)
    await Promise.all(
      rest.map(chain => callBackground({ getAccount: { chain } }))
    )
  }

  /**
   * Keplr-shaped chain list for every Cosmos chain Vultisig exposes natively
   * plus any chains a dApp has registered via `experimentalSuggestChain`.
   * cosmos-kit dApps probe this BEFORE showing their
   * connect modal — the base implementation forwards to a sidecar background
   * handler we don't run, so it resolves with `undefined` and the dApp throws
   * on `q.chainInfos`.
   */
  async getChainInfosWithoutEndpoints(): Promise<ChainInfoWithoutEndpoints[]> {
    const infos = await getKeplrCosmosChainInfos()
    return infos.map(stripEndpoints)
  }

  async getChainInfoWithoutEndpoints(
    chainId: string
  ): Promise<ChainInfoWithoutEndpoints> {
    const infos = await getKeplrCosmosChainInfos()
    const info = infos.find(c => c.chainId === chainId)
    return stripEndpoints(
      shouldBePresent(info, `There is no chain info for ${chainId}`)
    )
  }

  getOfflineSigner(
    chainId: string,
    _signOptions?: KeplrSignOptions
  ): OfflineAminoSigner & OfflineDirectSigner {
    const cosmSigner = new CosmJSOfflineSigner(chainId, this, _signOptions)

    cosmSigner.getAccounts = async (): Promise<AccountData[]> =>
      getAccounts(chainId)

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
    assertNativeChainForSigning(chainId)
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
    assertNativeChainForSigning(chainId)
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

  /**
   * Registers a Cosmos chain that the dApp has asked the wallet to support.
   *
   * - Validates the ChainInfo shape and rejects malformed input with a
   *   Keplr-shaped error so dApps can surface a useful message.
   * - Idempotent: subsequent calls for an already-known `chainId` (native or
   *   previously suggested) resolve silently with no popup.
   * - On first call for a new chainId, opens the suggest-chain approval
   *   popup. If the user approves, the entry is persisted via
   *   `addKeplrSuggestedChain` and survives browser restarts. If the user
   *   rejects, the promise rejects with a Keplr-shaped error.
   * - cosmos-kit / graz dApps that target a chain not in our hardcoded list
   *   call this before `enable` to bootstrap the chain into the wallet;
   *   without it `enable` fails with `"There is no chain info for ${chainId}"`.
   *
   * Note: suggested chains that Vultisig cannot natively sign for are
   * accepted into the registry for introspection (and for `enable` to stop
   * rejecting), but `getKey` / `signAmino` / `signDirect` will still throw
   * until native support for the chain is added.
   */
  async experimentalSuggestChain(chainInfo: ChainInfo): Promise<void> {
    validateSuggestedChainInfo(chainInfo)

    if (isNativeKeplrChainId(chainInfo.chainId)) return

    // Coalesce concurrent calls for the same chainId
    const inFlight = this.suggestInFlight.get(chainInfo.chainId)
    if (inFlight) return inFlight

    const work = this.suggestMutex
      .runExclusive(async () => {
        // Re-check inside the lock: a prior parallel call for this chain (or
        // a previous session) may have already persisted it. The same lock
        // also serializes popups for different chains so the user sees them
        // one at a time instead of N stacked windows.
        const existing = await callBackground({ getKeplrSuggestedChains: {} })
        if (existing[chainInfo.chainId]) return

        const { error } = await attempt(
          callPopup({ suggestKeplrChain: { chainInfo } })
        )
        if (error === PopupError.RejectedByUser) {
          throw new Error(`Request rejected by user`)
        }
        if (error) {
          throw error
        }

        await callBackground({ addKeplrSuggestedChain: { chainInfo } })
      })
      .finally(() => {
        this.suggestInFlight.delete(chainInfo.chainId)
      })

    this.suggestInFlight.set(chainInfo.chainId, work)
    return work
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
