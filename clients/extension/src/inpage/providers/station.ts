import { callBackground } from '@core/inpage-provider/background'
import { addBackgroundEventListener } from '@core/inpage-provider/background/events/inpage'
import { callPopup } from '@core/inpage-provider/popup'
import { TransactionDetails } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { StdFee } from '@cosmjs/amino'
import { Chain, CosmosChain } from '@vultisig/core-chain/Chain'
import {
  getCosmosChainByChainId,
  getCosmosChainId,
} from '@vultisig/core-chain/chains/cosmos/chainInfo'
import { cosmosFeeCoinDenom } from '@vultisig/core-chain/chains/cosmos/cosmosFeeCoinDenom'
import { CosmosMsgType } from '@vultisig/core-chain/chains/cosmos/cosmosMsgTypes'
import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { getBlockExplorerUrl } from '@vultisig/core-chain/utils/getBlockExplorerUrl'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { NotImplementedError } from '@vultisig/lib-utils/error/NotImplementedError'
import { validateUrl } from '@vultisig/lib-utils/validation/url'

import { requestAccount } from './core/requestAccount'
import { stationFeeToAmino, stationMsgToAmino } from './stationProtoAmino'
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
 * Terra dApps detect Vultisig as a Station-compatible wallet and sign or
 * post via `window.station.sign(...)` / `window.station.post(...)`, or use
 * the cosmjs / Keplr path through `window.station.keplr.*`.
 *
 * The two write paths differ:
 *
 * - `sign` keeps the amino path: messages are normalized to amino in
 *   {@link stationMsgToAmino}, signed via `XDEFIKeplrProvider.signAmino`,
 *   and the amino-shaped response is returned to the dApp (which
 *   broadcasts itself).
 * - `post` routes through the popup's protobuf signing path
 *   (`msgPayload`/`wasmExecuteContractGeneric`). The popup signs in
 *   `SIGN_MODE_DIRECT` and broadcasts via Vultisig's standard Cosmos
 *   broadcast resolver. Going through amino here would emit the signed
 *   tx into TW's `output.json` field, which the broadcast resolver does
 *   not consume — see issue investigation in PR review.
 *
 * `post` is currently limited to single-message `wasm/MsgExecuteContract`
 * txs (covers Astroport, Skip, etc.); other shapes throw and the dApp
 * should fall back to `sign`.
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
   * Signs a Station tx in amino (legacy) mode and returns the signed envelope
   * — does NOT broadcast (matches Station's `sign` contract). Messages are
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
   * Signs and broadcasts a single-message `wasm/MsgExecuteContract` tx. The
   * popup signs in `SIGN_MODE_DIRECT` (via `wasmExecuteContractGeneric`) so
   * TW emits a properly-formed protobuf `TxRaw`, which Vultisig's standard
   * Cosmos broadcast resolver consumes. Returns Station's `PostResponse`
   * shape with the broadcast tx hash.
   *
   * Throws for non-wasm or multi-message txs — those should use {@link sign}
   * and broadcast on the dApp side, since the protobuf TW path here only
   * wires up the contract-execute message type.
   */
  async post(tx: StationTxRequest): Promise<StationPostResponse> {
    const chain = shouldBePresent(
      getCosmosChainByChainId(tx.chainID),
      `Station post: unrecognized chainID ${tx.chainID}`
    )

    if (tx.msgs.length !== 1) {
      throw new Error(
        `Station post: only single-message txs are supported (got ${tx.msgs.length}); use sign() and broadcast yourself for multi-msg txs.`
      )
    }

    const [aminoMsg] = tx.msgs.map(msg => stationMsgToAmino(msg, chain))

    if (aminoMsg.type !== 'wasm/MsgExecuteContract') {
      throw new Error(
        `Station post: msg type "${aminoMsg.type}" not supported. Only wasm/MsgExecuteContract can be broadcast; use sign() and broadcast yourself.`
      )
    }

    const wasmValue = aminoMsg.value as {
      sender: string
      contract: string
      funds?: Array<{ denom: string; amount: string }>
      msg: unknown
    }

    const account = await requestAccount(chain)

    // Proto MsgExecuteContract.msg is `bytes` (utf-8 of JSON). The keysign
    // pipeline accepts this as a string and TW serializes it into the proto
    // bytes via `wasmExecuteContractGeneric.executeMsg`.
    const executeMsg =
      typeof wasmValue.msg === 'string'
        ? wasmValue.msg
        : JSON.stringify(wasmValue.msg)

    const funds = wasmValue.funds ?? []

    // Surface the dApp's fee for display only — cosmos chainSpecific does not
    // currently honor `gasSettings.gasLimit`, so the popup falls back to its
    // built-in gas record. Astroport-style swaps may need follow-up to plumb
    // the dApp's gasLimit through the cosmos signing input.
    const stationFee = tx.fee ? stationFeeToAmino(tx.fee) : undefined

    const transactionDetails: TransactionDetails = {
      asset: {
        ticker: funds[0]?.denom ?? chainFeeCoin[chain].ticker,
      },
      amount: {
        amount: funds[0]?.amount ?? '0',
        decimals: chainFeeCoin[chain].decimals,
      },
      from: account.address,
      to: wasmValue.contract,
      data: tx.memo,
      gasSettings: stationFee?.gas
        ? { gasLimit: String(stationFee.gas) }
        : undefined,
      msgPayload: {
        case: CosmosMsgType.MSG_EXECUTE_CONTRACT,
        value: {
          sender: wasmValue.sender,
          contract: wasmValue.contract,
          funds,
          msg: executeMsg,
        },
      },
    }

    const [{ hash }] = await callPopup(
      { sendTx: { keysign: { transactionDetails, chain } } },
      { account: account.address }
    )

    return {
      txhash: hash,
      height: '0',
      raw_log: '',
      code: 0,
    }
  }

  async signBytes(
    _bytes: string,
    _chainId?: string,
    _purgeQueue = true
  ): Promise<never> {
    throw new NotImplementedError('Station signBytes')
  }

  async signArbitrary(
    _bytes: string,
    _chainId?: string,
    _purgeQueue = true
  ): Promise<never> {
    throw new NotImplementedError('Station signArbitrary')
  }

  async switchNetwork(
    _network: NetworkName,
    _purgeQueue = true
  ): Promise<never> {
    throw new NotImplementedError('Station switchNetwork')
  }

  getOfflineSigner(chainId: string) {
    return this.keplr.getOfflineSignerOnlyAmino(chainId)
  }
}
