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
import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { getBlockExplorerUrl } from '@vultisig/core-chain/utils/getBlockExplorerUrl'
import {
  CosmosFee,
  CosmosMsg,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
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
 * post via `window.station.sign(...)` / `window.station.post(...)`
 * (proto-direct messages are normalized to amino in
 * {@link stationMsgToAmino}), or via the cosmjs / Keplr path through
 * `window.station.keplr.*`. All routes flow through the same Vultisig MPC
 * keysign pipeline; `post` differs from `sign` only in leaving
 * `skipBroadcast` unset so the popup also broadcasts.
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

  static getInstance(keplrProvider: XDEFIKeplrProvider): Station {
    if (!Station.instance) {
      Station.instance = new Station(keplrProvider)
    }
    return Station.instance
  }

  emitWalletChange(): void {
    window.dispatchEvent(new CustomEvent(stationWalletChangeEvent))
  }

  emitNetworkChange(): void {
    window.dispatchEvent(new CustomEvent(stationNetworkChangeEvent))
  }

  async info(): Promise<InfoResponse> {
    return terraInfo
  }

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

  async getPublicKey(): Promise<ConnectResponse> {
    return this.connect()
  }

  async theme(): Promise<string> {
    return 'dark'
  }

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

  async post(tx: StationTxRequest): Promise<StationPostResponse> {
    const chain = shouldBePresent(
      getCosmosChainByChainId(tx.chainID),
      `Station post: unrecognized chainID ${tx.chainID}`
    )

    const msgs = tx.msgs.map(msg => stationMsgToAmino(msg, chain))
    const fee = tx.fee ? stationFeeToAmino(tx.fee) : { amount: [], gas: '0' }
    const memo = tx.memo ?? ''

    const account = await requestAccount(chain)

    // Mirrors `aminoHandler` in xdefiKeplr.ts but with `skipBroadcast` left
    // unset so the keysign popup signs *and* broadcasts. The msgs/fee cast
    // matches the existing routing boundary — values are JSON-stringified
    // downstream in `keysignPayload/build.ts`.
    const firstMsgValue = (msgs[0]?.value ?? {}) as {
      funds?: Array<{ denom: string; amount: string }>
      sender?: string
      from_address?: string
      to_address?: string
      contract?: string
    }

    const transactionDetails: TransactionDetails = {
      asset: {
        ticker: firstMsgValue.funds?.[0]?.denom ?? chainFeeCoin[chain].ticker,
      },
      amount: {
        amount: firstMsgValue.funds?.[0]?.amount ?? '0',
        decimals: chainFeeCoin[chain].decimals,
      },
      from: account.address,
      to: firstMsgValue.contract ?? firstMsgValue.to_address,
      data: memo,
      aminoPayload: {
        msgs: msgs as unknown as CosmosMsg[],
        fee: fee as CosmosFee,
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
