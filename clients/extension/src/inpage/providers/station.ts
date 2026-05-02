import { callBackground } from '@core/inpage-provider/background'
import { addBackgroundEventListener } from '@core/inpage-provider/background/events/inpage'
import { callPopup } from '@core/inpage-provider/popup'
import { TransactionDetails } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { StdFee } from '@cosmjs/amino'
import { Chain, CosmosChain } from '@vultisig/core-chain/Chain'
import { getCosmosAccountInfo } from '@vultisig/core-chain/chains/cosmos/account/getCosmosAccountInfo'
import {
  getCosmosChainByChainId,
  getCosmosChainId,
} from '@vultisig/core-chain/chains/cosmos/chainInfo'
import { cosmosFeeCoinDenom } from '@vultisig/core-chain/chains/cosmos/cosmosFeeCoinDenom'
import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'
import { parseCosmosSerialized } from '@vultisig/core-chain/chains/cosmos/utils/parseCosmosSerialized'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
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
  assertWasmExecuteTxRaw,
  encodeAuthInfo,
  encodeTxBody,
  encodeWasmExecuteAny,
} from './stationProtoEncode'
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
 * The two write paths use different signing modes by design:
 *
 * - `sign` keeps the amino legacy path (matches Station's `sign` contract):
 *   messages normalized via {@link stationMsgToAmino}, signed through MPC
 *   keysign, repackaged in Station's response shape, returned to the dApp
 *   to broadcast.
 * - `post` is `SIGN_MODE_DIRECT` only: we encode `MsgExecuteContract` proto
 *   bytes ourselves (see {@link stationProtoEncode}) and pass them via
 *   `directPayload` so TW signs the bytes verbatim. After the popup signs,
 *   we **decode the resulting `TxRaw` and assert** `messages[0].typeUrl`
 *   matches the wasm execute we built before broadcasting — defense in
 *   depth so a re-encoded message type cannot be broadcast.
 *
 * `post` is currently limited to single-message `wasm/MsgExecuteContract`
 * txs; other shapes throw and the dApp
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
   * Signs and broadcasts a single-message `wasm/MsgExecuteContract` tx via
   * `SIGN_MODE_DIRECT`. The body / authInfo bytes are encoded by us in
   * {@link stationProtoEncode}; the popup signs verbatim, and we
   * {@link assertWasmExecuteTxRaw}-check the resulting `TxRaw` before
   * broadcasting via the standard Cosmos broadcast resolver. Returns
   * Station's `PostResponse` shape with the broadcast tx hash.
   *
   * Throws for non-wasm or multi-message txs — those should use {@link sign}
   * and broadcast on the dApp side. Also throws if the dApp didn't supply a
   * non-zero gas limit (we don't substitute a default for a contract execute,
   * since under-billed gas can fail mid-execution and burn fees).
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
    const funds = wasmValue.funds ?? []
    const executeMsg =
      typeof wasmValue.msg === 'string'
        ? wasmValue.msg
        : JSON.stringify(wasmValue.msg)

    const account = await requestAccount(chain)
    const accountInfo = await getCosmosAccountInfo({
      chain,
      address: account.address,
    })

    // Build the proto-direct bodyBytes / authInfoBytes ourselves. The popup's
    // signDirect path passes these to TW verbatim — TW signs them and emits a
    // TxRaw containing the same bytes, so what we encode here is what the
    // chain executes. The post-sign assertion below is defense in depth.
    const bodyBytes = encodeTxBody({
      messages: [
        encodeWasmExecuteAny({
          sender: wasmValue.sender,
          contract: wasmValue.contract,
          msg: executeMsg,
          funds,
        }),
      ],
      memo: tx.memo ?? '',
    })

    const stationFee = tx.fee ? stationFeeToAmino(tx.fee) : undefined
    const feeAmount: Array<{ denom: string; amount: string }> = stationFee
      ? stationFee.amount.map(c => ({ denom: c.denom, amount: c.amount }))
      : []
    const gasLimit = stationFee?.gas ? BigInt(stationFee.gas) : 0n
    if (gasLimit === 0n) {
      throw new Error(
        'Station post: dApp did not provide a fee with a non-zero `gas` field. Refusing to broadcast — without a gas limit the chain would either reject or silently underbill the contract execution.'
      )
    }

    const authInfoBytes = encodeAuthInfo({
      publicKey: hexToBytes(account.publicKey),
      sequence: BigInt(accountInfo.sequence ?? 0),
      fee: {
        amount: feeAmount,
        gasLimit,
        payer: stationFee?.payer,
        granter: stationFee?.granter,
      },
    })

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
      directPayload: {
        bodyBytes: Buffer.from(bodyBytes).toString('base64'),
        authInfoBytes: Buffer.from(authInfoBytes).toString('base64'),
        chainId: tx.chainID,
        accountNumber: String(accountInfo.accountNumber ?? 0),
      },
      // Sign only — we broadcast manually below after verifying the signed
      // body actually contains the wasm execute we encoded.
      skipBroadcast: true,
    }

    const [{ data }] = await callPopup(
      { sendTx: { keysign: { transactionDetails, chain } } },
      { account: account.address }
    )

    const signingOutput = deserializeSigningOutput(chain, data)
    const { tx_bytes } = parseCosmosSerialized(
      'serialized' in signingOutput ? signingOutput.serialized : undefined
    )
    const txRawBytes = Buffer.from(tx_bytes, 'base64')

    // CRITICAL safety check — verify the bytes about to be broadcast actually
    // encode our wasm execute, not something else (e.g. a MsgSend fallback).
    // Throws if the body was rewritten or empty.
    assertWasmExecuteTxRaw({
      txRawBytes,
      expected: {
        sender: wasmValue.sender,
        contract: wasmValue.contract,
      },
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
