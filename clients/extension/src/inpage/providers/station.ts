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

type ConnectResponse = {
  addresses: Record<ChainID, string>
  ledger: boolean
  name: string
  network: NetworkName
  pubkey?: {
    '330': string
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

type TerraStationOverrides = {
  name: string
  icon: string
  gasAdjustment: number
  gasPrices: Record<string, number>
  isClassic?: boolean
}

const terraStationOverrides: Record<
  typeof Chain.Terra | typeof Chain.TerraClassic,
  TerraStationOverrides
> = {
  [Chain.Terra]: {
    name: 'Terra',
    icon: 'https://assets.terra.dev/icon/svg/Terra.svg',
    gasAdjustment: 1.75,
    gasPrices: { uluna: 0.015 },
  },
  [Chain.TerraClassic]: {
    name: 'Terra Classic',
    icon: 'https://assets.terra.dev/icon/svg/LUNC.svg',
    gasAdjustment: 2,
    gasPrices: { uluna: 28.325 },
    isClassic: true,
  },
}

const stationExplorerUrl = (
  chain: CosmosChain,
  entity: 'address' | 'tx'
): string => getBlockExplorerUrl({ chain, entity, value: '{}' })

const buildTerraChainInfo = (
  chain: typeof Chain.Terra | typeof Chain.TerraClassic
): ChainInfo => {
  const chainId = getCosmosChainId(chain)
  const addressUrl = stationExplorerUrl(chain, 'address')
  const txUrl = stationExplorerUrl(chain, 'tx')
  return {
    baseAsset: cosmosFeeCoinDenom[chain],
    chainID: chainId,
    coinType: '330',
    explorer: {
      address: addressUrl,
      block: addressUrl,
      tx: txUrl,
      validator: addressUrl,
    },
    lcd: cosmosRpcUrl[chain],
    prefix: 'terra',
    ...terraStationOverrides[chain],
  }
}

const terraInfo: InfoResponse = {
  [getCosmosChainId(Chain.Terra)]: buildTerraChainInfo(Chain.Terra),
  [getCosmosChainId(Chain.TerraClassic)]: buildTerraChainInfo(
    Chain.TerraClassic
  ),
}

const terraChainByCosmosChainId: Record<string, Chain> = {
  [getCosmosChainId(Chain.Terra)]: Chain.Terra,
  [getCosmosChainId(Chain.TerraClassic)]: Chain.TerraClassic,
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
 * `signBytes`, `signArbitrary`, and `switchNetwork` are surfaced for
 * detection but throw `NotImplementedError` — arbitrary-bytes signing has
 * not shipped in {@link XDEFIKeplrProvider} either.
 */
export class Station {
  static instance: Station | null = null

  isVultisig = true
  isVulticonnect = true
  debugMode = false

  readonly keplr: XDEFIKeplrProvider

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
   * Returns the Terra chain registry (Terra v2 + Terra Classic) in Station's
   * `InfoResponse` shape — dApps call this before connecting to discover
   * supported chains, gas prices, and explorer URLs.
   */
  async info(): Promise<InfoResponse> {
    return terraInfo
  }

  /**
   * Requests the active Terra account and returns it in Station's
   * `ConnectResponse` shape, mapping the same address under every supported
   * Terra chain ID (one Terra address works for both phoenix-1 and columbus-5).
   */
  async connect(): Promise<ConnectResponse> {
    const account = await requestAccount(Chain.Terra)
    const vault = await callBackground({ exportVault: {} })

    const addresses: Record<ChainID, string> = {}
    for (const chainId of Object.keys(terraChainByCosmosChainId)) {
      addresses[chainId] = account.address
    }

    return {
      addresses,
      ledger: false,
      name: vault.name,
      network: 'mainnet',
      pubkey: {
        '330': Buffer.from(account.publicKey, 'hex').toString('base64'),
      },
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
   * Network switching — surfaced for detection but not implemented; Vultisig
   * binds Terra to mainnet (phoenix-1 / columbus-5) and does not expose
   * testnet or localterra.
   */
  async switchNetwork(
    _network: NetworkName,
    _purgeQueue = true
  ): Promise<never> {
    throw new NotImplementedError('Station switchNetwork')
  }

  /** Returns the amino-only `OfflineSigner` from the underlying Keplr provider — Terra dApps that build txs via cosmjs use this to sign locally. */
  getOfflineSigner(chainId: string) {
    return this.keplr.getOfflineSignerOnlyAmino(chainId)
  }
}
