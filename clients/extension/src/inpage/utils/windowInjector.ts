import { createCardanoCip30InitialApi } from '@clients/extension/src/inpage/providers/cardanoCip30'
import { Ethereum } from '@clients/extension/src/inpage/providers/ethereum'
import { createProviders } from '@clients/extension/src/inpage/providers/providerFactory'
import { callBackground } from '@core/inpage-provider/background'
import { callPopup } from '@core/inpage-provider/popup'
import { Chain, UtxoChain } from '@vultisig/core-chain/Chain'
import { attempt } from '@vultisig/lib-utils/attempt'
import { announceProvider, EIP1193Provider } from 'mipd'
import { v4 as uuidv4 } from 'uuid'

import { currentExtensionBrandConfig } from '../../brand/extensionBrandConfig'
import { installKeplrProxyBridge } from '../providers/keplrProxyBridge'
import { Solana } from '../providers/solana'
import { registerWallet } from '../providers/solana/register'
import { UTXO } from '../providers/utxo'
import { createXrplProvider, installXrplAdapter } from '../providers/xrpl'

// Wallet-picker descriptor pushed to `window.terraWallets` /
// `window.interchainWallets`. Mirrors the `STATION_INFO` shape the official
// Station extension uses — Terra dApps iterate these arrays to discover
// installed Station-compatible wallets.
const stationWalletInfo = {
  name: currentExtensionBrandConfig.provider.walletPickerName,
  identifier: currentExtensionBrandConfig.provider.walletPickerIdentifier,
  icon: currentExtensionBrandConfig.provider.icon,
}

const pushToWalletArray = (key: 'terraWallets' | 'interchainWallets') => {
  const existing = window[key]
  if (Array.isArray(existing)) {
    existing.push(stationWalletInfo)
  } else {
    window[key] = [stationWalletInfo]
  }
}

export const injectToWindow = () => {
  const providers = createProviders()
  const ethereumProvider = providers.ethereum

  const vultisigProvider = {
    ...providers,
    // Vultisig-native XRPL object API, alongside the GemWallet-detectable
    // postMessage adapter installed below.
    xrpl: createXrplProvider(),
    getVault: async () => callBackground({ exportVault: {} }),
    getVaults: async () => callPopup({ exportVaults: {} }),
  }

  Object.defineProperty(window, 'vultisig', {
    value: vultisigProvider,
    configurable: false,
    writable: false,
  })

  if (!window.ethereum) {
    attempt(() =>
      Object.defineProperty(window, 'ethereum', {
        value: ethereumProvider,
        configurable: true,
        writable: true,
      })
    )
  }

  announceProvider({
    info: {
      icon: currentExtensionBrandConfig.provider.icon,
      name: currentExtensionBrandConfig.provider.eip6963Name,
      rdns: currentExtensionBrandConfig.provider.eip6963Rdns,
      uuid: uuidv4(),
    },
    provider: ethereumProvider as unknown as EIP1193Provider,
  })

  // CIP-30 Cardano dApp-Wallet Web Bridge
  if (!window.cardano) {
    attempt(() =>
      Object.defineProperty(window, 'cardano', {
        value: {},
        configurable: true,
        writable: true,
      })
    )
  }
  if (window.cardano) {
    attempt(() =>
      Object.defineProperty(window.cardano, 'vultisig', {
        value: createCardanoCip30InitialApi(),
        configurable: false,
        writable: false,
      })
    )
  }

  if (!window.tonkeeper) {
    attempt(() =>
      Object.defineProperty(window, 'tonkeeper', {
        value: providers.ton,
        configurable: true,
        writable: true,
      })
    )
  }

  // Keplr injection has to be synchronous. cosmos-kit dApps run an
  // auto-reconnect effect on first render that reads `window.keplr` and
  // clears their persisted wallet state if it's missing — so deferring
  // this behind the async `setupContentScriptMessenger` path raced page
  // refreshes and left users in a stuck "Connect Wallet does nothing"
  // state. The `!window.keplr` guard preserves the existing wallet if
  // another Keplr-compatible extension already injected one. Each
  // helper is set behind its own existence check so a preexisting
  // non-configurable global on one of them can't prevent the others
  // from being defined.
  if (!window.keplr) {
    Object.defineProperty(window, 'keplr', {
      value: providers.keplr,
      configurable: false,
      writable: false,
    })
    if (!window.getOfflineSigner) {
      Object.defineProperty(window, 'getOfflineSigner', {
        value: providers.keplr.getOfflineSigner.bind(providers.keplr),
        configurable: false,
        writable: false,
      })
    }
    if (!window.getOfflineSignerOnlyAmino) {
      Object.defineProperty(window, 'getOfflineSignerOnlyAmino', {
        value: providers.keplr.getOfflineSignerOnlyAmino.bind(providers.keplr),
        configurable: false,
        writable: false,
      })
    }
    if (!window.getOfflineSignerAuto) {
      Object.defineProperty(window, 'getOfflineSignerAuto', {
        value: providers.keplr.getOfflineSignerAuto.bind(providers.keplr),
        configurable: false,
        writable: false,
      })
    }
    installKeplrProxyBridge(providers.keplr)
  }

  // Terra/Station injection mirrors the Keplr treatment above: synchronous
  // and ungated. Cosmos/Terra discovery must not depend on EVM precedence
  // (the "Prioritize Vultisig" setting) — that flag only exists to win the
  // `window.ethereum` fight with other EVM wallets. dApps that snapshot
  // installed wallets on page load can also miss a late injection deferred
  // behind the async `setupContentScriptMessenger` background round-trip.
  // The `!window.station` / `!window.terra` guards defer to the official
  // Station extension when it injected first; the `terraWallets` /
  // `interchainWallets` arrays still advertise this build as its own picker
  // row so the two extensions co-exist instead of silently clobbering each
  // other. Each global is set behind its own existence check so a
  // preexisting non-configurable one can't block the others.
  if (!window.station) {
    attempt(() =>
      Object.defineProperty(window, 'station', {
        value: providers.station,
        configurable: false,
        writable: false,
      })
    )
  }
  if (!window.terra) {
    attempt(() =>
      Object.defineProperty(window, 'terra', {
        value: providers.station,
        configurable: false,
        writable: false,
      })
    )
  }
  // Detection flags Terra dApps probe before showing Station in the wallet
  // picker — both legacy (`isTerraExtensionAvailable`) and the newer
  // interchain alias (`isStationExtensionAvailable`).
  if (!window.isTerraExtensionAvailable) {
    attempt(() =>
      Object.defineProperty(window, 'isTerraExtensionAvailable', {
        value: true,
        configurable: false,
        writable: false,
      })
    )
  }
  if (!window.isStationExtensionAvailable) {
    attempt(() =>
      Object.defineProperty(window, 'isStationExtensionAvailable', {
        value: true,
        configurable: false,
        writable: false,
      })
    )
  }
  // Register this build in the Station-style wallet-picker arrays. dApps
  // iterate these to enumerate installed Station-compatible wallets, so
  // missing this entry hides the provider from the picker even when
  // `window.station` is present.
  attempt(() => pushToWalletArray('terraWallets'))
  attempt(() => pushToWalletArray('interchainWallets'))

  // The XRPL adapter is detectable as GemWallet — the injectable API XRPL dApps
  // integrate against. Like Keplr above, it must be synchronous: dApps snapshot
  // the installed wallets on first render, so deferring behind the async
  // background round-trip below would hide us from the picker. The guard defers
  // to a real GemWallet that already claimed the page.
  if (!window.gemWallet) {
    attempt(() => installXrplAdapter())
  }

  setupContentScriptMessenger(providers)
}

async function setupContentScriptMessenger(
  providers: ReturnType<typeof createProviders>
) {
  const ethereumProvider = providers.ethereum

  const [vultisigDefaultProvider, hasSolanaResult, hasSuiResult] =
    await Promise.all([
      callBackground({ getIsWalletPrioritized: {} }),
      attempt(callBackground({ hasChainInVault: { chain: Chain.Solana } })),
      attempt(callBackground({ hasChainInVault: { chain: Chain.Sui } })),
    ])
  const hasSolana = hasSolanaResult.data ?? false
  const hasSui = hasSuiResult.data ?? false

  const phantomProvider = {
    bitcoin: new UTXO(UtxoChain.Bitcoin, 'phantom-override'),
    ethereum: ethereumProvider,
    ...(hasSolana && { solana: providers.solana }),
    ...(hasSui && { sui: providers.sui }),
  }

  if (hasSolana) {
    registerWallet(providers.solana)
  }

  if (hasSui) {
    registerWallet(providers.sui)
  }

  if (vultisigDefaultProvider) {
    if (hasSolana) {
      registerWallet(new Solana('MetaMask'))
    }
    providers.tron.init()

    if (window.cardano && !window.cardano.lace) {
      attempt(() =>
        Object.defineProperty(window.cardano, 'lace', {
          value: createCardanoCip30InitialApi(),
          configurable: false,
          writable: false,
        })
      )
    }

    const providerCopy = Object.create(
      Object.getPrototypeOf(ethereumProvider),
      Object.getOwnPropertyDescriptors(ethereumProvider)
    )
    providerCopy.isMetaMask = false

    announceProvider({
      info: {
        icon: currentExtensionBrandConfig.provider.icon,
        name: currentExtensionBrandConfig.provider.eip6963Name,
        rdns: 'app.phantom',
        uuid: uuidv4(),
      },
      provider: ethereumProvider as unknown as EIP1193Provider,
    })
    attempt(() =>
      Object.defineProperties(window, {
        tronLink: {
          value: providers.tron,
          configurable: false,
          writable: false,
        },
        tonkeeper: {
          value: providers.ton,
          configurable: false,
          writable: false,
        },
        ethereum: {
          get: () => window.vultiConnectRouter.currentProvider,
          set: newProvider =>
            window.vultiConnectRouter.addProvider(newProvider),
          configurable: false,
        },
        xfi: { value: providers, configurable: false, writable: false },
        isCtrl: { value: true, configurable: false, writable: false },
        vultiConnectRouter: {
          value: {
            ethereumProvider,
            lastInjectedProvider: window.ethereum,
            currentProvider: ethereumProvider,
            providers: [
              ethereumProvider,
              ...(window.ethereum ? [window.ethereum] : []),
            ],
            setDefaultProvider(vultiAsDefault: boolean) {
              this.currentProvider = vultiAsDefault
                ? window.vultisig.ethereum
                : this.lastInjectedProvider
            },
            addProvider(provider: Ethereum) {
              if (!this.providers.includes(provider))
                this.providers.push(provider)
              if (ethereumProvider !== provider)
                this.lastInjectedProvider = provider
            },
          },
          configurable: false,
          writable: false,
        },
        phantom: {
          value: phantomProvider,
          configurable: false,
          writable: false,
        },
        injectedWeb3: {
          value: {
            ...(window.injectedWeb3 || {}),
            'polkadot-js': {
              enable: (origin?: string) => providers.polkadot.enable(origin),
              version: '0.46.9',
            },
            bittensor: {
              enable: (origin?: string) => providers.bittensor.enable(origin),
              version: '0.46.9',
            },
          },
          configurable: true,
          writable: true,
        },
      })
    )
  }
}
