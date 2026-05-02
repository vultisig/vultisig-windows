import { callBackground } from '@core/inpage-provider/background'
import { addBackgroundEventListener } from '@core/inpage-provider/background/events/inpage'
import { Chain, CosmosChain } from '@vultisig/core-chain/Chain'
import { getCosmosChainId } from '@vultisig/core-chain/chains/cosmos/chainInfo'
import { cosmosFeeCoinDenom } from '@vultisig/core-chain/chains/cosmos/cosmosFeeCoinDenom'
import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'
import { getBlockExplorerUrl } from '@vultisig/core-chain/utils/getBlockExplorerUrl'
import { NotImplementedError } from '@vultisig/lib-utils/error/NotImplementedError'
import { validateUrl } from '@vultisig/lib-utils/validation/url'

import { requestAccount } from './core/requestAccount'
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
 * Lets Terra dApps detect Vultisig as a Station-compatible wallet and use
 * the cosmjs / Keplr signing path via `window.station.keplr.*`.
 *
 * `sign`, `post`, `signBytes`, `signArbitrary`, and `switchNetwork` are
 * surfaced for detection but currently throw `NotImplementedError` — the
 * full Station tx pipeline (proto → amino conversion, broadcast) is tracked
 * as a follow-up.
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
   * to point at the same provider, and the constructor wires a single
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
   * Requests the active Terra account from the Vultisig vault and returns it
   * in Station's `ConnectResponse` shape, mapping the same address under every
   * supported Terra chain ID (one Terra address works for both phoenix-1 and
   * columbus-5).
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
   * Station tx signing — surfaced for dApp detection but not yet implemented.
   * The proto-direct → amino conversion and MPC keysign routing land in a
   * follow-up; until then dApps should fall back to `station.keplr.*`.
   */
  async sign(_tx: unknown): Promise<never> {
    throw new NotImplementedError('Station sign')
  }

  /**
   * Station tx broadcast — surfaced for detection but not yet implemented
   * (see {@link Station.sign}).
   */
  async post(_tx: unknown): Promise<never> {
    throw new NotImplementedError('Station post')
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
