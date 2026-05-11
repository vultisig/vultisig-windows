import VULTI_ICON_RAW_SVG from '@clients/extension/src/inpage/icon'
import { createCardanoCip30InitialApi } from '@clients/extension/src/inpage/providers/cardanoCip30'
import { Ethereum } from '@clients/extension/src/inpage/providers/ethereum'
import { createProviders } from '@clients/extension/src/inpage/providers/providerFactory'
import { callBackground } from '@core/inpage-provider/background'
import { callPopup } from '@core/inpage-provider/popup'
import { Chain, UtxoChain } from '@vultisig/core-chain/Chain'
import { attempt } from '@vultisig/lib-utils/attempt'
import { announceProvider, EIP1193Provider } from 'mipd'
import { v4 as uuidv4 } from 'uuid'

import { installKeplrProxyBridge } from '../providers/keplrProxyBridge'
import { Solana } from '../providers/solana'
import { registerWallet } from '../providers/solana/register'
import { UTXO } from '../providers/utxo'

// Wallet-picker descriptor pushed to `window.terraWallets` /
// `window.interchainWallets`. Mirrors the `STATION_INFO` shape the official
// Station extension uses — Terra dApps iterate these arrays to discover
// installed Station-compatible wallets.
const vultisigStationInfo = {
  name: 'Vultisig',
  identifier: 'vultisig',
  icon: `data:image/svg+xml;utf8,${encodeURIComponent(VULTI_ICON_RAW_SVG)}`,
}

const pushToWalletArray = (key: 'terraWallets' | 'interchainWallets') => {
  const existing = window[key]
  if (Array.isArray(existing)) {
    existing.push(vultisigStationInfo)
  } else {
    window[key] = [vultisigStationInfo]
  }
}

export const injectToWindow = () => {
  const providers = createProviders()
  const ethereumProvider = providers.ethereum

  const vultisigProvider = {
    ...providers,
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
      icon: VULTI_ICON_RAW_SVG,
      name: 'Vultisig',
      rdns: 'me.vultisig',
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

  setupContentScriptMessenger(providers)
}

async function setupContentScriptMessenger(
  providers: ReturnType<typeof createProviders>
) {
  const ethereumProvider = providers.ethereum

  const [vultisigDefaultProvider, hasSolanaResult] = await Promise.all([
    callBackground({ getIsWalletPrioritized: {} }),
    attempt(callBackground({ hasChainInVault: { chain: Chain.Solana } })),
  ])
  const hasSolana = hasSolanaResult.data ?? false

  const phantomProvider = {
    bitcoin: new UTXO(UtxoChain.Bitcoin, 'phantom-override'),
    ethereum: ethereumProvider,
    ...(hasSolana && { solana: providers.solana }),
  }

  if (hasSolana) {
    registerWallet(providers.solana)
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
        icon: VULTI_ICON_RAW_SVG,
        name: 'Vultisig',
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
        station: {
          value: providers.station,
          configurable: false,
          writable: false,
        },
        terra: {
          value: providers.station,
          configurable: false,
          writable: false,
        },
        // Detection flags Terra dApps probe before showing Station in the
        // wallet picker — both legacy (`isTerraExtensionAvailable`) and the
        // newer interchain alias (`isStationExtensionAvailable`).
        isTerraExtensionAvailable: {
          value: true,
          configurable: false,
          writable: false,
        },
        isStationExtensionAvailable: {
          value: true,
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

    // Register Vultisig in the Station-style wallet-picker arrays. dApps
    // iterate these to enumerate installed Station-compatible wallets, so
    // missing this entry hides Vultisig from the picker even when
    // `window.station` is present.
    attempt(() => pushToWalletArray('terraWallets'))
    attempt(() => pushToWalletArray('interchainWallets'))
  }
}
