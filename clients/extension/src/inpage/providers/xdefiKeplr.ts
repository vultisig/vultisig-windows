import { callBackground } from '@core/inpage-provider/background'
import { addBackgroundEventListener } from '@core/inpage-provider/background/events/inpage'
import { callPopup } from '@core/inpage-provider/popup'
import { PopupError } from '@core/inpage-provider/popup/error'
import { TransactionDetails } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { serializeAdr36SignDoc } from '@core/ui/mpc/keysign/customMessage/adr36'
import { AminoMsg, StdFee } from '@cosmjs/amino'
import { ripemd160, sha256 } from '@cosmjs/crypto'
import { fromBase64 } from '@cosmjs/encoding'
import {
  CosmJSOfflineSigner,
  CosmJSOfflineSignerOnlyAmino,
  Keplr,
} from '@keplr-wallet/provider'
import {
  AccountData,
  AminoSignResponse,
  BroadcastMode,
  ChainInfo,
  ChainInfoWithoutEndpoints,
  DirectSignResponse,
  KeplrMode,
  KeplrSignOptions,
  Key,
  OfflineAminoSigner,
  OfflineDirectSigner,
  SettledResponses,
  StdSignature,
  StdSignDoc,
} from '@keplr-wallet/types'
import { SignDoc as KeplrSignDoc } from '@keplr-wallet/types/build/cosmjs'
import { secp256k1 } from '@noble/curves/secp256k1'
import { TW } from '@trustwallet/wallet-core'
import { Chain, OtherChain } from '@vultisig/core-chain/Chain'
import { getCosmosChainByChainId } from '@vultisig/core-chain/chains/cosmos/chainInfo'
import { CosmosMsgType } from '@vultisig/core-chain/chains/cosmos/cosmosMsgTypes'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { deserializeSigningOutput } from '@vultisig/core-chain/tw/signingOutput'
import {
  CosmosFee,
  CosmosMsg,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { attempt, withFallback } from '@vultisig/lib-utils/attempt'
import { hexToBytes } from '@vultisig/lib-utils/hexToBytes'
import { match } from '@vultisig/lib-utils/match'
import { areLowerCaseEqual } from '@vultisig/lib-utils/string/areLowerCaseEqual'
import { validateUrl } from '@vultisig/lib-utils/validation/url'
import { bech32 } from 'bech32'
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import { TxBody, TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { MsgTransfer } from 'cosmjs-types/ibc/applications/transfer/v1/tx'
import Long from 'long'

import { EIP1193Error } from '../../background/handlers/errorHandler'
import { currentExtensionBrandConfig } from '../../brand/extensionBrandConfig'
import { getCosmosChainFromAddress } from '../../utils/cosmos/getCosmosChainFromAddress'
import { requestAccount } from './core/requestAccount'
import { Cosmos } from './cosmos'
import { injectKeplrFeeIfMissing } from './cosmos/injectKeplrFeeIfMissing'
import { normalizeCosmosAuthInfoFee } from './cosmos/normalizeAuthInfoFee'
import { normalizeKeplrBytes } from './cosmos/normalizeKeplrBytes'
import {
  getKeplrCosmosChainInfos,
  getKeplrSupportedChainByChainId,
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

type DirectHandlerSignDoc = {
  bodyBytes: string // base64 encoded
  authInfoBytes: string // base64 encoded
  chainId: string
  accountNumber: string
}

type DirectHandlerInput = {
  signDoc: DirectHandlerSignDoc
  chain: Chain
  signer: string
}

// Fallback display payload when the dApp's bodyBytes can't be decoded as a
// standard TxBody (e.g. chain-specific extension fields cosmjs-types doesn't
// know about, or a non-standard envelope). Signing still proceeds because the
// raw bytes are forwarded to the popup via `directPayload`.
const genericDirectTransactionDetails = ({
  signDoc,
  chain,
  signer,
}: DirectHandlerInput): TransactionDetails => ({
  asset: { ticker: chainFeeCoin[chain].ticker },
  amount: { amount: '0', decimals: chainFeeCoin[chain].decimals },
  from: signer,
  directPayload: {
    bodyBytes: signDoc.bodyBytes,
    authInfoBytes: signDoc.authInfoBytes,
    chainId: signDoc.chainId,
    accountNumber: signDoc.accountNumber,
  },
  skipBroadcast: true,
})

const directHandler = ({
  signDoc,
  chain,
  signer,
}: DirectHandlerInput): TransactionDetails => {
  // Body decoding is best-effort — used only to enrich the popup's display
  // info. If the dApp's TxBody has fields cosmjs-types can't parse (newer
  // SDK additions, Osmosis/Injective extensions, etc.) fall back to a
  // generic display and let the raw bytes flow through to keysign untouched.
  const decoded = attempt(() =>
    TxBody.decode(Buffer.from(signDoc.bodyBytes, 'base64'))
  )
  if ('error' in decoded) {
    return genericDirectTransactionDetails({ signDoc, chain, signer })
  }
  const txBody = decoded.data
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

type CosmosSigningOutput = InstanceType<typeof TW.Cosmos.Proto.SigningOutput>

// SDK's `deserializeSigningOutput<T extends Chain>` returns a union driven by
// `DeriveChainKind<T>`. Both `cosmos` and `qbtc` kinds map to the same
// `TW.Cosmos.Proto.SigningOutput` class (see `signingOutputs` in
// `core-chain/tw/signingOutput`), but the generic widens through indexed
// access. Validate the Cosmos-shape fields at the boundary and narrow.
function assertCosmosSigningOutput(
  output: unknown
): asserts output is CosmosSigningOutput {
  if (
    !output ||
    typeof output !== 'object' ||
    typeof (output as { json?: unknown }).json !== 'string' ||
    typeof (output as { serialized?: unknown }).serialized !== 'string'
  ) {
    throw new Error(
      'Expected Cosmos signing output with `.json` and `.serialized` strings'
    )
  }
}

const standardCosmosCoinType = 118

// Signing flows require Vultisig native support for the chain (transaction
// encoding, fee handling, broadcast). Suggested-but-not-native chains can do
// read-only `getKey` via the Cosmos Hub key + bech32-prefix swap, but signing
// has no fallback — surface a Keplr-shaped error so dApps display a clear
// "chain not supported" message instead of our generic assertion throw.
const assertNativeChainForSigning = (chainId: string): void => {
  if (!getKeplrSupportedChainByChainId(chainId)) {
    throw new Error(`Chain ${chainId} is not supported for signing`)
  }
}

const mldsaRequiredKeplrMessage = `QBTC requires an MLDSA-enabled vault. Enable MLDSA in ${currentExtensionBrandConfig.provider.walletPickerName} Developer Options and create a new vault.`

const getAccounts = async (chainId: string): Promise<AccountData[]> => {
  const nativeChain = getKeplrSupportedChainByChainId(chainId)
  if (nativeChain) {
    const { publicKey, address } = await requestAccount(nativeChain)

    // `getAccount` returns `{ address: '', publicKey: '' }` for MLDSA chains
    // when the selected vault has no `publicKeyMldsa`. Surface the same
    // Unauthorized error the native `window.vultisig.qbtc` provider throws,
    // otherwise downstream `getKey()` / signing fail at `bech32.decode('')`
    // with an opaque error.
    if (nativeChain === OtherChain.QBTC && !address) {
      throw new EIP1193Error('Unauthorized', mldsaRequiredKeplrMessage)
    }

    return [
      {
        // QBTC signs with MLDSA-44; Keplr's `Algo` union predates
        // post-quantum signing and only allows secp256k1/ed25519/sr25519.
        // We declare secp256k1 so the cast typechecks, but the bytes in
        // `pubkey` are the raw MLDSA hex from the vault. dApps that only
        // pass the pubkey through to a broadcast are unaffected; dApps
        // that verify signatures must use MLDSA verification regardless.
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

// Every method on the inherited Keplr base class that we don't explicitly
// override routes through this requester (the base wraps calls in
// `sendSimpleMessage(this.requester, ...)`). The previous no-op silently
// resolved `undefined`, which let any unhandled method "succeed" with a
// nonsense value — dApps then exploded on `q.chainInfos` or similar with
// no path back to the root cause.
//
// Throwing here makes unhandled methods fail loudly and uniformly. dApps
// can catch and fall back; bugs in our override coverage surface at the
// call site instead of three layers downstream. For the methods cosmos-kit
// actually exercises (`getKeysSettled`, `getKey`, `enable`, ...) we
// override on `XDEFIKeplrProvider`, so this requester is reached only by
// truly unhandled paths.
// Keplr's `SimpleMessage` exposes its route via a `type()` method (symbol-
// backed field), not a `type` property — naive property access would
// stringify the function source into the error message.
const readMessageType = (msg: unknown): string | undefined => {
  if (!msg || typeof msg !== 'object') return undefined
  const candidate = msg as { type?: unknown; method?: unknown }
  if (typeof candidate.type === 'function') {
    const result = (candidate.type as () => unknown).call(msg)
    return typeof result === 'string' ? result : undefined
  }
  if (typeof candidate.type === 'string') return candidate.type
  if (typeof candidate.method === 'string') return candidate.method
  return undefined
}

class XDEFIMessageRequester {
  constructor() {
    this.sendMessage = this.sendMessage.bind(this)
  }
  public async sendMessage(message: any, params: any): Promise<void> {
    const method =
      readMessageType(params) ?? readMessageType(message) ?? 'unknown'
    throw new Error(
      `Keplr method '${method}' is not supported by ${currentExtensionBrandConfig.provider.walletPickerName}`
    )
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

    // `keplr_keystorechange` is Keplr's stale-key signal — dApps re-fetch
    // `getKey` when they see it. The background fires `disconnect` when
    // the host's appSession is removed (either via our `disable` /
    // `signOut` flow or because the user revoked the dApp grant). Until
    // now, the dispatch lived on the Station provider's constructor, so
    // dApps that loaded only `window.keplr` (no Terra Station) never
    // saw the event. Skip on the wallet's own UI to avoid wiring the
    // listener inside the extension popup.
    if (!validateUrl(window.location.href)) {
      addBackgroundEventListener('disconnect', () => {
        this.emitAccountsChanged()
      })
    }
  }

  private async runWithChain<T>(
    chainId: string,
    fn: () => Promise<T>
  ): Promise<T> {
    return this.mutex.runExclusive(async () => {
      if (!getKeplrSupportedChainByChainId(chainId)) {
        throw new EIP1193Error('UnrecognizedChain')
      }

      // `setAppChain({ cosmos })` drives the wallet UI's Cosmos chain
      // switcher. QBTC isn't a `CosmosChain` (chain kind is `'qbtc'`) and
      // has no equivalent active-chain state, so skip the call when the
      // chainId isn't one of the SDK's CosmosChain values — the popup
      // keysign payload carries the chain explicitly anyway.
      const cosmosChain = getCosmosChainByChainId(chainId)
      if (cosmosChain) {
        const selectedChainId = await callBackground({
          getAppChainId: { chainKind: 'cosmos' },
        })

        if (selectedChainId !== chainId) {
          await callBackground({
            setAppChain: { cosmos: cosmosChain },
          })
        }
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
      const chain = getKeplrSupportedChainByChainId(chainId)
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
    // grant-vault popup surfaces exactly once while recording the full
    // requested chain set. Running every chain through `requestAccount` in
    // parallel raced multiple popups against each other — only one would
    // win, the others returned no `appSession` and the dApp got back
    // `EIP1193Error('InternalError')`.
    const [primary, ...rest] = nativeChains
    await requestAccount(primary, { chains: nativeChains })
    await Promise.all(
      rest.map(chain => callBackground({ getAccount: { chain } }))
    )
  }

  /**
   * Revokes the dApp's permission to query the wallet, mirroring Keplr's
   * `disable`. Subsequent `enable` / `getKey` / `getOfflineSigner` calls
   * will surface the grant-vault popup again.
   *
   * Vultisig's `appSession` is host-keyed (not host+chain-keyed), so we
   * can't selectively revoke a single chain — `disable(['cosmoshub-4'])`
   * has the same effect as `disable()`. The `chainIds` argument is
   * accepted for API compatibility but otherwise ignored. Most dApps
   * that call this only care about the all-chains "log out" outcome.
   */
  async disable(_chainIds?: string | string[]): Promise<void> {
    await callBackground({ signOut: {} })
    this.emitAccountsChanged()
  }

  /**
   * Reports whether the host has an active vault grant. cosmos-kit / graz
   * adapters call this on hydration to decide between auto-reconnect and
   * showing the connect button; the inherited base routes through our
   * requester and throws, which surfaces an unhandled rejection in the
   * dApp console and confuses some adapters.
   *
   * Vultisig's `appSession` is host-keyed (not host+chain-keyed), so the
   * `chainIds` argument is accepted for API compatibility but ignored:
   * either the host holds a grant for everything it can query, or nothing.
   */
  async isEnabled(_chainIds: string | string[]): Promise<boolean> {
    return callBackground({ hasAppSession: {} })
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

  /**
   * Keplr's reference implementation returns the amino-only signer when
   * the active key is on a hardware Ledger (Ledger can't sign protobuf
   * direct payloads) and the combined amino+direct signer otherwise.
   * Vultisig is an MPC wallet — there is no Ledger in the signing path
   * (`getKey` hardcodes `isNanoLedger: false`), so always return the
   * combined signer. Overriding the inherited base — which would call
   * `XDEFIMessageRequester.sendMessage` and silently resolve `undefined`
   * — makes the cosmos-kit pre-connect probe see a usable signer.
   */
  async getOfflineSignerAuto(
    chainId: string,
    signOptions?: KeplrSignOptions
  ): Promise<OfflineAminoSigner | OfflineDirectSigner> {
    return this.getOfflineSigner(chainId, signOptions)
  }

  // Liveness probe used by cosmos-kit-based dApps (osmosis.zone, etc.)
  // during their `Initializing Wallet Client` step. The base implementation
  // calls `requester.sendMessage` directly via the free `sendSimpleMessage`
  // helper — bypassing our instance-level `sendSimpleMessage` override — so
  // without this method the requester throws and the dApp can't connect.
  async ping(): Promise<void> {
    return
  }

  async sendTx(
    chainId: string,
    tx: Uint8Array,
    _mode: BroadcastMode
  ): Promise<Uint8Array> {
    // cosmos-kit dApps sign with `signDirect` / `signAmino` (which Vultisig
    // handles with `skipBroadcast`) and then call `sendTx` with the encoded
    // `TxRaw` bytes to publish the transaction. Broadcasting runs in the
    // background service worker — like real Keplr — so it isn't blocked by the
    // dApp page's CSP via the SDK's shared broadcast path. Returns the tx-hash
    // bytes the dApp uses to track inclusion. `_mode` is ignored — the SDK
    // broadcast resolver picks the broadcast semantics.
    const chain = getKeplrSupportedChainByChainId(chainId)
    if (!chain) {
      throw new Error(`Keplr.sendTx is not supported for chain ${chainId}`)
    }

    const { txHash } = await callBackground({
      broadcastTx: {
        chain,
        txBytes: Buffer.from(tx).toString('base64'),
      },
    })

    return hexToBytes(txHash)
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

      const chain = shouldBePresent(getKeplrSupportedChainByChainId(chainId))

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
      assertCosmosSigningOutput(output)

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

      // The function argument `chainId` drives chain-config lookups (fee
      // denom, gas price, popup display); the `signDoc.chainId` field is the
      // value the signature commits to. If those diverge the dApp would
      // either trick us into picking the wrong fee/denom or end up with a
      // signature whose committed chainId doesn't match the chain it asked us
      // to switch to. Reject early — real Keplr does the same check.
      if (signDoc.chainId !== chainId) {
        throw new Error(
          `signDoc.chainId (${signDoc.chainId}) does not match requested chainId (${chainId})`
        )
      }

      const chain = shouldBePresent(getKeplrSupportedChainByChainId(chainId))

      const rawBodyBytes = normalizeKeplrBytes(signDoc.bodyBytes)
      const rawAuthInfoBytes = normalizeKeplrBytes(signDoc.authInfoBytes)

      // Several cosmos-kit dApps (Osmosis Zone's staking page being the
      // canonical example) pass an empty `fee.amount` and rely on the wallet
      // to fill it in — real Keplr injects a fee from gasLimit * gas price
      // whenever `signOptions.preferNoSetFee` is falsy (the default). Match
      // that behavior here, otherwise the chain rejects the broadcast with
      // "Expected 1 fee denom attached, got 0: insufficient fee".
      const withInjectedFee =
        chain === OtherChain.QBTC || _signOptions?.preferNoSetFee
          ? rawAuthInfoBytes
          : injectKeplrFeeIfMissing({
              authInfoBytes: rawAuthInfoBytes,
              chain,
            })

      // `normalizeCosmosAuthInfoFee` swaps fee ticker → canonical denom for
      // CosmosChain entries. QBTC's fee denom is already canonical (`qbtc`,
      // matching the chain config base denom), so the normalization is a
      // no-op and the helper isn't keyed for QBTC anyway.
      const normalizedAuthInfoBytes =
        chain === OtherChain.QBTC
          ? withInjectedFee
          : normalizeCosmosAuthInfoFee(withInjectedFee, chain)
      const transactionDetails: TransactionDetails = directHandler({
        signDoc: {
          bodyBytes: Buffer.from(rawBodyBytes).toString('base64'),
          authInfoBytes: Buffer.from(normalizedAuthInfoBytes).toString(
            'base64'
          ),
          chainId: signDoc.chainId,
          accountNumber: signDoc.accountNumber.toString(),
        },
        chain,
        signer,
      })

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
      assertCosmosSigningOutput(output)
      const { serialized } = output
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
   * ADR-36 arbitrary-message signing — used by Leap-style "sign-in-with-
   * cosmos" auth flows and several governance dApps.
   *
   * ADR-36 wraps the data in a fixed `StdSignDoc{MsgSignData}` envelope and
   * signs `sha256(serialized signDoc)` with the chain's secp256k1 key. That
   * digest is signed through the same custom-message keysign path EVM
   * `personal_sign` uses, so no transaction-compiler involvement is needed.
   * The popup returns the `r‖s‖recovery` bytes; we drop the recovery byte and
   * base64-encode `r‖s` into a Keplr `StdSignature`.
   */
  async signArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array
  ): Promise<StdSignature> {
    assertNativeChainForSigning(chainId)
    return this.runWithChain(chainId, async () => {
      const chain = getCosmosChainByChainId(chainId)
      if (!chain) {
        throw new Error(
          `Keplr.signArbitrary is not supported for chain ${chainId}`
        )
      }

      const [account] = await getAccounts(chainId)
      if (!areLowerCaseEqual(signer, account.address)) {
        throw new Error('Signer does not match current account address')
      }

      const dataBytes =
        typeof data === 'string' ? new TextEncoder().encode(data) : data
      const dataBase64 = Buffer.from(dataBytes).toString('base64')

      const signatureHex = await callPopup(
        {
          signMessage: {
            cosmos_sign_arbitrary: { chain, data: dataBase64 },
          },
        },
        { account: account.address }
      )

      // rawWithRecoveryId format: r(32) || s(32) || recovery(1).
      const rs = Buffer.from(signatureHex, 'hex').subarray(0, 64)

      return {
        pub_key: {
          type: 'tendermint/PubKeySecp256k1',
          value: Buffer.from(account.pubkey).toString('base64'),
        },
        signature: Buffer.from(rs).toString('base64'),
      }
    })
  }

  /**
   * Paired with `signArbitrary`. Pure secp256k1 verification — reconstructs
   * the ADR-36 sign-doc from `(signer, data)`, confirms the supplied pubkey
   * actually derives to `signer`, then checks the signature over the digest.
   *
   * Inputs come from the dApp, so malformed base64/bech32/signature must
   * resolve to `false` (the contract Keplr consumers expect) rather than
   * rejecting the promise — hence the `attempt` + `false` fallback.
   */
  async verifyArbitrary(
    _chainId: string,
    signer: string,
    data: string | Uint8Array,
    signature: StdSignature
  ): Promise<boolean> {
    return withFallback(
      attempt(() => {
        const dataBytes =
          typeof data === 'string' ? new TextEncoder().encode(data) : data
        const dataBase64 = Buffer.from(dataBytes).toString('base64')

        const digest = sha256(serializeAdr36SignDoc({ signer, dataBase64 }))

        const pubkey = fromBase64(signature.pub_key.value)
        const sigBytes = fromBase64(signature.signature)
        if (sigBytes.length !== 64) return false

        const derivedAddress = bech32.encode(
          bech32.decode(signer).prefix,
          bech32.toWords(ripemd160(sha256(pubkey)))
        )
        if (!areLowerCaseEqual(derivedAddress, signer)) return false

        return secp256k1.verify(sigBytes, digest, pubkey)
      }),
      false
    )
  }

  /**
   * EIP-712-typed-data Cosmos signing for Evmos / Injective / dymension and
   * other Ethermint-style chains, which derive their signer from a secp256k1
   * Ethereum key and sign amino docs wrapped in an EIP-712 envelope.
   *
   * Not yet implemented: needs (a) an Ethermint-aware key derivation path
   * since Vultisig's Cosmos signer assumes coinType-118 secp256k1 and (b)
   * an EIP-712 hashing pass on top of the amino doc. Throwing here gives
   * Evmos/Injective dApps a deterministic signal to fall back to
   * `signAmino` (which several of them do) instead of resolving `undefined`
   * from the inherited base requester.
   */
  async experimentalSignEIP712CosmosTx_v0(
    _chainId: string,
    _signer: string,
    _eip712: {
      types: Record<string, { name: string; type: string }[] | undefined>
      domain: Record<string, unknown>
      primaryType: string
    },
    _signDoc: StdSignDoc,
    _signOptions?: KeplrSignOptions
  ): Promise<AminoSignResponse> {
    throw new Error(
      `Keplr.experimentalSignEIP712CosmosTx_v0 is not supported by ${currentExtensionBrandConfig.provider.walletPickerName}`
    )
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

  /**
   * Batch variant of {@link getKey} — cosmos-kit's pre-connect probe calls
   * this with the full chain set instead of N serial `getKey` calls, so an
   * unhandled implementation routed through the inherited base (and our
   * now-throwing requester) would explode the whole probe. Mirror Keplr's
   * `Promise.allSettled`-shaped result so unknown chains surface as
   * per-entry `rejected` instead of failing the whole batch.
   */
  async getKeysSettled(chainIds: string[]): Promise<SettledResponses<Key>> {
    return Promise.all(
      chainIds.map(async chainId => {
        const result = await attempt(() => this.getKey(chainId))
        if ('error' in result) {
          const reason =
            result.error instanceof Error
              ? result.error
              : new Error(String(result.error))
          return { status: 'rejected', reason } as const
        }
        return { status: 'fulfilled', value: result.data } as const
      })
    )
  }
}
