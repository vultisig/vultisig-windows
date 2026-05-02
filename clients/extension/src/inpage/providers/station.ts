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

  async sign(_tx: unknown): Promise<never> {
    throw new NotImplementedError('Station sign')
  }

  async post(_tx: unknown): Promise<never> {
    throw new NotImplementedError('Station post')
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
