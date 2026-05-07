import { callBackground } from '@core/inpage-provider/background'
import { addBackgroundEventListener } from '@core/inpage-provider/background/events/inpage'
import { AminoMsg, StdFee } from '@cosmjs/amino'
import { Chain, CosmosChain } from '@vultisig/core-chain/Chain'
import { getCosmosAccountInfo } from '@vultisig/core-chain/chains/cosmos/account/getCosmosAccountInfo'
import {
  getCosmosChainByChainId,
  getCosmosChainId,
} from '@vultisig/core-chain/chains/cosmos/chainInfo'
import { cosmosFeeCoinDenom } from '@vultisig/core-chain/chains/cosmos/cosmosFeeCoinDenom'
import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'
import { deserializeSigningOutput } from '@vultisig/core-chain/tw/signingOutput'
import { broadcastTx } from '@vultisig/core-chain/tx/broadcast'
import { getTxHash } from '@vultisig/core-chain/tx/hash'
import { getBlockExplorerUrl } from '@vultisig/core-chain/utils/getBlockExplorerUrl'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { NotImplementedError } from '@vultisig/lib-utils/error/NotImplementedError'
import { hexToBytes } from '@vultisig/lib-utils/hexToBytes'
import { validateUrl } from '@vultisig/lib-utils/validation/url'

import { requestAccount } from './core/requestAccount'
import { stationFeeToAmino, stationMsgToAmino } from './stationProtoAmino'
import {
  assertAminoMsgsMatch,
  buildLegacyAminoTxRawBytes,
} from './stationTxAssembly'
import { XDEFIKeplrProvider } from './xdefiKeplr'

type ChainID = string

type ChainInfo = {
  baseAsset: string
  chainID: ChainID
  coinType: '330' | '118'
  explorer: {
    address: string
    block: string
    tx: string
    validator: string
  }
  gasAdjustment: number
  gasPrices: Record<string, number>
  icon: string
  lcd: string
  name: string
  prefix: string
  isClassic?: boolean
}

type InfoResponse = Record<ChainID, ChainInfo>

type NetworkName = 'mainnet' | 'testnet' | 'classic' | 'localterra'

// `@terra-money/station-connector`'s `.d.ts` omits `address`, but the
// official Station extension's contentScript ships the full `wallet` storage
// object — which DOES include a top-level `address` (the primary chain's
// account). wallet-kit / TFM read `connectedWallet.address` as the primary
// identity; omitting it leaves the dApp rendering an empty "connected" state.
//
// Both `pubkey` coinTypes are optional (the official `.d.ts` requires `'330'`).
// A Cosmos-only vault without Terra still needs to expose `'118'` for
// cosmos-kit's `StationClient.getAccount`, which keys lookup by coinType.
type ConnectResponse = {
  address: string
  addresses: Record<ChainID, string>
  ledger: boolean
  name: string
  network: NetworkName
  pubkey?: {
    '330'?: string
    '118'?: string
  }
}

type StationTxRequest = {
  chainID: string
  msgs: unknown[]
  fee?: unknown
  memo?: string
}

type StationSignResponse = {
  auth_info: {
    signer_infos: Array<{
      public_key: { type_url: string; key: string }
      mode_info: { single: { mode: string } }
      sequence: string
    }>
    fee: StdFee
  }
  body: {
    messages: unknown[]
    memo: string
    timeout_height: string
    extension_options: unknown[]
    non_critical_extension_options: unknown[]
  }
  signatures: string[]
  fee: StdFee
}

type StationPostResponse = {
  height: string
  raw_log: string
  txhash: string
  code: number
  codespace?: string
}

// All Vultisig-supported IBC-enabled Cosmos chains the Station provider
// exposes. cosmos-kit dApps (TFM, Leap, etc.) call
// `getSimpleAccount(chainId)` per chain configured in their modal — any
// chain missing from `connect().addresses` makes the dApp silently mark the
// wallet as not connected (no console error, modal stays open).
type SupportedStationChain =
  | typeof Chain.Cosmos
  | typeof Chain.Osmosis
  | typeof Chain.Dydx
  | typeof Chain.Kujira
  | typeof Chain.Terra
  | typeof Chain.TerraClassic
  | typeof Chain.Noble
  | typeof Chain.Akash

type SupportedNetworkName = 'mainnet' | 'classic'

// Per-network chain set. Terra v2 (phoenix-1) and Terra Classic
// (columbus-5) both use the bech32 prefix `terra` — wallet-kit /
// cosmos-kit reject duplicate prefixes within a single network's chain
// set, so they live in different network buckets the same way the
// official Station extension partitions its `networks` storage.
// `switchNetwork('classic')` toggles to Terra Classic.
const stationChainsByNetwork: Record<
  SupportedNetworkName,
  readonly SupportedStationChain[]
> = {
  mainnet: [
    Chain.Cosmos,
    Chain.Osmosis,
    Chain.Dydx,
    Chain.Kujira,
    Chain.Terra,
    Chain.Noble,
    Chain.Akash,
  ],
  classic: [Chain.TerraClassic],
}

// Bech32 HRP per chain. Hard-coded rather than derived from a sample
// address because we need the prefix in `info()` BEFORE we've fetched any
// account.
const stationChainPrefix: Record<SupportedStationChain, string> = {
  Cosmos: 'cosmos',
  Osmosis: 'osmo',
  Dydx: 'dydx',
  Kujira: 'kujira',
  Terra: 'terra',
  TerraClassic: 'terra',
  Noble: 'noble',
  Akash: 'akash',
}

// BIP44 coinType per chain. Cosmos-style chains use 118; Terra-family
// uses the legacy LUNA coinType 330. Drives `pubkey['330'|'118']` lookup
// in cosmos-kit's `StationClient.getAccount()`.
const stationChainCoinType: Record<SupportedStationChain, '330' | '118'> = {
  Cosmos: '118',
  Osmosis: '118',
  Dydx: '118',
  Kujira: '118',
  Terra: '330',
  TerraClassic: '330',
  Noble: '118',
  Akash: '118',
}

const stationChainGasPrices: Record<
  SupportedStationChain,
  Record<string, number>
> = {
  Cosmos: { uatom: 0.025 },
  Osmosis: { uosmo: 0.025 },
  Dydx: { adydx: 12500000000 },
  Kujira: { ukuji: 0.0034 },
  Terra: { uluna: 0.015 },
  TerraClassic: { uluna: 28.325 },
  Noble: { uusdc: 0.025 },
  Akash: { uakt: 0.025 },
}

const stationChainGasAdjustment: Record<SupportedStationChain, number> = {
  Cosmos: 1.5,
  Osmosis: 1.5,
  Dydx: 1.5,
  Kujira: 1.5,
  Terra: 1.75,
  TerraClassic: 2,
  Noble: 1.5,
  Akash: 1.5,
}

const stationChainDisplayName: Record<SupportedStationChain, string> = {
  Cosmos: 'Cosmos Hub',
  Osmosis: 'Osmosis',
  Dydx: 'dYdX',
  Kujira: 'Kujira',
  Terra: 'Terra',
  TerraClassic: 'Terra Classic',
  Noble: 'Noble',
  Akash: 'Akash',
}

const stationExplorerUrl = (
  chain: CosmosChain,
  entity: 'address' | 'tx'
): string => getBlockExplorerUrl({ chain, entity, value: '{}' })

const buildStationChainInfo = (chain: SupportedStationChain): ChainInfo => {
  const chainId = getCosmosChainId(chain)
  const addressUrl = stationExplorerUrl(chain, 'address')
  const txUrl = stationExplorerUrl(chain, 'tx')
  return {
    baseAsset: cosmosFeeCoinDenom[chain],
    chainID: chainId,
    coinType: stationChainCoinType[chain],
    explorer: {
      address: addressUrl,
      block: addressUrl,
      tx: txUrl,
      validator: addressUrl,
    },
    gasAdjustment: stationChainGasAdjustment[chain],
    gasPrices: stationChainGasPrices[chain],
    icon: '',
    lcd: cosmosRpcUrl[chain],
    name: stationChainDisplayName[chain],
    prefix: stationChainPrefix[chain],
    ...(chain === Chain.TerraClassic ? { isClassic: true } : {}),
  }
}

const isSupportedNetwork = (
  network: NetworkName
): network is SupportedNetworkName => network in stationChainsByNetwork

const buildStationInfoForNetwork = (
  network: SupportedNetworkName
): InfoResponse => {
  const info: InfoResponse = {}
  for (const chain of stationChainsByNetwork[network]) {
    info[getCosmosChainId(chain)] = buildStationChainInfo(chain)
  }
  return info
}

// First chain to request via `requestAccount` (which surfaces the popup
// once). Subsequent chains in the same network are fetched silently via
// `callBackground({ getAccount })` — they piggyback on the same dApp
// authorization, no extra popups even for normal multi-chain vaults.
const networkPrimaryChain: Record<SupportedNetworkName, SupportedStationChain> =
  {
    mainnet: Chain.Cosmos,
    classic: Chain.TerraClassic,
  }

// Builds the `pubkey` field for ConnectResponse — base64-encoded pubkeys
// keyed by the chain's BIP44 coinType. cosmos-kit's
// `StationClient.getAccount` looks up `pubkeys[info.coinType]`; missing
// the coinType the dApp expects throws "requested account is not
// available". Picks the first account fetched per coinType, since both
// 118-coinType chains derive from the same HD path (and likewise for 330).
const buildStationPubkeyMap = (
  accounts: ReadonlyArray<{
    chain: SupportedStationChain
    account: { address: string; publicKey: string }
  }>
): { '330'?: string; '118'?: string } | undefined => {
  const pubkey: { '330'?: string; '118'?: string } = {}
  for (const { chain, account } of accounts) {
    const coinType = stationChainCoinType[chain]
    if (pubkey[coinType]) continue
    pubkey[coinType] = Buffer.from(account.publicKey, 'hex').toString('base64')
  }
  return pubkey['118'] || pubkey['330'] ? pubkey : undefined
}

const stationWalletChangeEvent = 'station_wallet_change'
const stationNetworkChangeEvent = 'station_network_change'

/**
 * Adapter exposing the Terra Station injected-API surface
 * (`window.station` / `window.terra`) on top of {@link XDEFIKeplrProvider}.
 *
 * Both write paths use the amino legacy signing flow so the popup shows the
 * verbose amino body and dApps that probe `signed.msgs` get back the same
 * shape they submitted:
 *
 * - `sign` matches Station's `sign` contract: messages normalized via
 *   {@link stationMsgToAmino}, signed through MPC keysign, repackaged in
 *   Station's response shape, returned to the dApp (which broadcasts).
 * - `post` extends the same flow into a broadcast: after signing, the amino
 *   payload is assembled into a protobuf `TxRaw` with
 *   `SIGN_MODE_LEGACY_AMINO_JSON` (see {@link stationTxAssembly}) and pushed
 *   through Vultisig's standard Cosmos broadcast resolver. Per-message-type
 *   encoding is delegated to cosmjs's `AminoTypes` and `Registry`, so any
 *   bank / staking / distribution / gov / ibc / wasm message and any
 *   number of messages per tx are supported with no per-type code here.
 *
 * `switchNetwork` toggles between `mainnet` (Terra v2 + sister Cosmos chains)
 * and `classic` (Terra Classic) and emits `station_network_change` so dApps
 * re-read {@link connect}. `signBytes` / `signArbitrary` are surfaced for
 * detection but throw `NotImplementedError` — arbitrary-bytes signing has
 * not shipped in {@link XDEFIKeplrProvider} either.
 */
export class Station {
  static instance: Station | null = null

  isVultisig = true
  isVulticonnect = true
  debugMode = false

  readonly keplr: XDEFIKeplrProvider

  // Active Station network. Drives which chains `connect()` reports and
  // which slice of `info()` cosmos-kit / wallet-kit sees. Mutated only by
  // `switchNetwork()`, which emits `station_network_change` so dApps
  // re-read the active state.
  private currentNetwork: SupportedNetworkName = 'mainnet'

  private constructor(keplrProvider: XDEFIKeplrProvider) {
    this.keplr = keplrProvider

    if (!validateUrl(window.location.href)) {
      addBackgroundEventListener('disconnect', () => {
        this.emitWalletChange()
        this.keplr.emitAccountsChanged()
      })
    }
  }

  /**
   * Singleton accessor — Terra dApps expect `window.station` and `window.terra`
   * to share the same provider, and the constructor wires a single
   * `disconnect` listener that must not be duplicated on re-injection.
   */
  static getInstance(keplrProvider: XDEFIKeplrProvider): Station {
    if (!Station.instance) {
      Station.instance = new Station(keplrProvider)
    }
    return Station.instance
  }

  /** Dispatches the Station wallet-change event so dApps re-read the active account. */
  emitWalletChange(): void {
    window.dispatchEvent(new CustomEvent(stationWalletChangeEvent))
  }

  /** Dispatches the Station network-change event so dApps re-read network state. */
  emitNetworkChange(): void {
    window.dispatchEvent(new CustomEvent(stationNetworkChangeEvent))
  }

  /**
   * Returns the chains in the currently active network as a flat
   * `Record<ChainID, ChainInfo>` — the exact shape produced by the official
   * `@terra-money/station-connector`. Mainnet exposes Cosmos Hub, Osmosis,
   * dYdX, Kujira, Terra v2, Noble, and Akash; classic exposes Terra Classic.
   * Terra v2 and Terra Classic share the `terra` bech32 prefix and cannot
   * appear together in one network — call {@link switchNetwork}('classic')
   * to access Terra Classic.
   */
  async info(): Promise<InfoResponse> {
    return buildStationInfoForNetwork(this.currentNetwork)
  }

  /**
   * Returns Station's `ConnectResponse` for the currently active network,
   * with `addresses` covering every Cosmos chain Vultisig exposes for that
   * network. cosmos-kit's `StationClient.getSimpleAccount(chainId)` requires
   * an entry per configured chain — a missing chain throws and TFM/Leap
   * silently mark the wallet as not-connected.
   *
   * Account fetching is two-phase to avoid stacked grant popups:
   * 1. The network's primary chain (Cosmos Hub for mainnet, Terra Classic
   *    for classic) goes through {@link requestAccount}, which surfaces the
   *    grant-vault popup on first connect.
   * 2. Every other chain is fetched silently via `getAccount` background
   *    call. Once the dApp is authorized in step 1, normal multi-chain
   *    vaults derive every chain from the shared seed, so no further popups
   *    are needed. Chains the vault can't derive (key-import vaults missing
   *    the chain) are skipped instead of re-prompting.
   *
   * `pubkey` is populated under both BIP44 coinTypes — `'118'` from the
   * first non-Terra account fetched, `'330'` from a Terra-family account.
   * cosmos-kit's `StationClient.getAccount` looks up
   * `pubkeys[info.coinType]`, so missing the coinType the dApp's chain
   * expects throws "requested account is not available".
   *
   * The official station-connector `.d.ts` omits `address`, but the
   * official Station extension's contentScript ships the full `wallet`
   * storage object including `address` (the primary chain's account).
   * wallet-kit / TFM read `connectedWallet.address` as the primary
   * identity; omitting it leaves the dApp rendering an empty "connected"
   * state.
   */
  async connect(): Promise<ConnectResponse> {
    const chains = stationChainsByNetwork[this.currentNetwork]
    const primaryChain = networkPrimaryChain[this.currentNetwork]

    const primaryAccount = await requestAccount(primaryChain)

    // Phase 2: fetch every other chain silently via the authorized
    // background call. Background `getAccount` returns an empty address
    // for key-import vaults that don't have the chain — skip those rather
    // than re-prompting. Real errors (transport, auth) propagate so
    // connect() fails loudly rather than silently producing a partial map.
    const otherChains = chains.filter(chain => chain !== primaryChain)
    const otherAccounts = await Promise.all(
      otherChains.map(async chain => ({
        chain,
        account: await callBackground({ getAccount: { chain } }),
      }))
    )

    const accounts = [
      { chain: primaryChain, account: primaryAccount },
      ...otherAccounts,
    ].filter(({ account }) => !!account.address)

    const addresses: Record<ChainID, string> = {}
    for (const { chain, account } of accounts) {
      addresses[getCosmosChainId(chain)] = account.address
    }

    const pubkey = buildStationPubkeyMap(accounts)

    const vault = await callBackground({ exportVault: {} })

    // Top-level `address` is the primary chain's account when derivable; for
    // key-import vaults that can't derive the primary, fall back to the
    // first chain that did yield an account so the dApp still has an
    // identity to render.
    const address = primaryAccount.address || accounts[0]?.account.address || ''

    return {
      address,
      addresses,
      ledger: false,
      name: vault.name,
      network: this.currentNetwork,
      pubkey,
    }
  }

  /** Legacy Station alias for {@link connect} — kept for older `@terra-money/wallet-kit` versions that probe `getPublicKey`. */
  async getPublicKey(): Promise<ConnectResponse> {
    return this.connect()
  }

  /** Returns the theme hint used by the Station UI overlay; Vultisig is always dark. */
  async theme(): Promise<string> {
    return 'dark'
  }

  /**
   * Signs a Station tx in amino legacy mode and returns the signed envelope —
   * does NOT broadcast (matches Station's `sign` contract). Messages are
   * normalized via {@link stationMsgToAmino}, signed through the MPC keysign
   * popup, then repackaged into Station's response shape (`auth_info`,
   * `body`, `signatures`). The dApp is responsible for broadcasting.
   */
  async sign(tx: StationTxRequest): Promise<StationSignResponse> {
    const chain = shouldBePresent(
      getCosmosChainByChainId(tx.chainID),
      `Station sign: unrecognized chainID ${tx.chainID}`
    )

    const msgs = tx.msgs.map(msg => stationMsgToAmino(msg, chain))
    const fee = tx.fee ? stationFeeToAmino(tx.fee) : { amount: [], gas: '0' }
    const memo = tx.memo ?? ''

    const account = await requestAccount(chain)

    // account_number / sequence are not consumed by Vultisig's keysign popup
    // (it re-queries the chain). Pass placeholders to satisfy the StdSignDoc
    // shape required by `XDEFIKeplrProvider.signAmino`.
    const aminoResponse = await this.keplr.signAmino(
      tx.chainID,
      account.address,
      {
        chain_id: tx.chainID,
        account_number: '0',
        sequence: '0',
        msgs,
        fee,
        memo,
      }
    )

    const { signature: aminoSignature, signed } = aminoResponse

    return {
      auth_info: {
        signer_infos: [
          {
            public_key: {
              type_url: '/cosmos.crypto.secp256k1.PubKey',
              key: aminoSignature.pub_key.value,
            },
            mode_info: { single: { mode: 'SIGN_MODE_LEGACY_AMINO_JSON' } },
            sequence: signed.sequence,
          },
        ],
        fee: signed.fee,
      },
      body: {
        messages: [...signed.msgs],
        memo: signed.memo,
        timeout_height: '0',
        extension_options: [],
        non_critical_extension_options: [],
      },
      signatures: [aminoSignature.signature],
      fee: signed.fee,
    }
  }

  /**
   * Signs and broadcasts an arbitrary Cosmos tx using `SIGN_MODE_LEGACY_AMINO_JSON`.
   *
   * Routes the dApp's msgs through the same amino popup flow as {@link sign}
   * (so the user sees the verbose amino body), then assembles a protobuf
   * `TxRaw` with the amino signature embedded under the legacy mode. The
   * chain reconstructs the StdSignDoc from the proto-encoded body and
   * verifies against the amino signature — same hash, different wire format.
   *
   * Per-message-type encoding is delegated to cosmjs's `AminoTypes` and
   * `Registry` (default + wasm converters), so this method covers every
   * standard cosmos / ibc / cosmwasm msg type out of the box and supports
   * multi-message txs without per-type code here.
   *
   * Safety:
   * - Asserts the amino msgs returned by the signer match the msgs we
   *   submitted (so no in-flight rewrite slips through).
   * - `aminoTypes.fromAmino` throws on unknown types — failure mode is a
   *   clear error pre-broadcast, never a silent fallback to a different
   *   msg type.
   */
  async post(tx: StationTxRequest): Promise<StationPostResponse> {
    const chain = shouldBePresent(
      getCosmosChainByChainId(tx.chainID),
      `Station post: unrecognized chainID ${tx.chainID}`
    )

    const requestMsgs = tx.msgs.map(msg => stationMsgToAmino(msg, chain))
    const fee = tx.fee ? stationFeeToAmino(tx.fee) : { amount: [], gas: '0' }
    const memo = tx.memo ?? ''

    if (BigInt(fee.gas) === 0n) {
      throw new Error(
        'Station post: dApp did not provide a fee with a non-zero `gas` field. Refusing to broadcast — without a gas limit the chain would either reject or silently underbill the execution.'
      )
    }

    const account = await requestAccount(chain)
    const accountInfo = await getCosmosAccountInfo({
      chain,
      address: account.address,
    })

    // Sign via the standard amino popup. account_number / sequence here are
    // the values we believe the chain has at this moment; the signer's
    // chainSpecific resolver re-queries on the popup side, so a small race
    // window exists. If the queries diverge, broadcast fails with a chain
    // sequence-mismatch error (not silent — user retries).
    const aminoResponse = await this.keplr.signAmino(
      tx.chainID,
      account.address,
      {
        chain_id: tx.chainID,
        account_number: String(accountInfo.accountNumber),
        sequence: String(accountInfo.sequence),
        msgs: requestMsgs,
        fee,
        memo,
      }
    )

    const { signed, signature: aminoSignature } = aminoResponse
    // Keplr types declare `signed.msgs` as `readonly Msg[]` (distinct
    // declaration of the same shape as `AminoMsg`). Materialize a mutable
    // copy so the assembler's typed inputs accept it without an `as` cast.
    const signedMsgs = [...signed.msgs] as AminoMsg[]

    // Round-trip safety: what we asked to sign must equal what got signed.
    assertAminoMsgsMatch({ expected: requestMsgs, actual: signedMsgs })

    const txRawBytes = buildLegacyAminoTxRawBytes({
      aminoMsgs: signedMsgs,
      fee: signed.fee,
      memo: signed.memo,
      sequence: BigInt(signed.sequence),
      publicKey: hexToBytes(account.publicKey),
      signature: aminoSignature.signature,
    })

    const signingOutput = deserializeSigningOutput(chain, {
      serialized: JSON.stringify({
        tx_bytes: Buffer.from(txRawBytes).toString('base64'),
        mode: 'BROADCAST_MODE_SYNC',
      }),
    })

    await broadcastTx({ chain, tx: signingOutput })
    const hash = await getTxHash({ chain, tx: signingOutput })

    return {
      txhash: hash,
      height: '0',
      raw_log: '',
      code: 0,
    }
  }

  /**
   * Arbitrary-bytes signing — surfaced for detection but not implemented; the
   * underlying {@link XDEFIKeplrProvider} doesn't ship `signArbitrary` either.
   */
  async signBytes(
    _bytes: string,
    _chainId?: string,
    _purgeQueue = true
  ): Promise<never> {
    throw new NotImplementedError('Station signBytes')
  }

  /** Alias of {@link signBytes} kept for parity with Station's API surface. */
  async signArbitrary(
    _bytes: string,
    _chainId?: string,
    _purgeQueue = true
  ): Promise<never> {
    throw new NotImplementedError('Station signArbitrary')
  }

  /**
   * Switches the active Station network and emits `station_network_change`
   * (plus `station_wallet_change`) so wallet-kit / dApps re-call
   * {@link connect} and re-read the active chain set. Only `mainnet`
   * (Cosmos-118 chains + Terra v2) and `classic` (Terra Classic) are
   * supported — `testnet` and `localterra` reject because Vultisig does not
   * derive testnet accounts.
   *
   * No-op if the requested network is already active.
   */
  async switchNetwork(
    network: NetworkName,
    _purgeQueue = true
  ): Promise<{ success: true; network: NetworkName }> {
    if (!isSupportedNetwork(network)) {
      throw new Error(
        `Station switchNetwork: unsupported network '${network}' — Vultisig only exposes 'mainnet' and 'classic'.`
      )
    }

    if (network !== this.currentNetwork) {
      this.currentNetwork = network
      this.emitNetworkChange()
      this.emitWalletChange()
    }

    return { success: true, network: this.currentNetwork }
  }

  /** Returns the amino-only `OfflineSigner` from the underlying Keplr provider — Terra dApps that build txs via cosmjs use this to sign locally. */
  getOfflineSigner(chainId: string) {
    return this.keplr.getOfflineSignerOnlyAmino(chainId)
  }
}
