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

import { Solana } from '../providers/solana'
import { registerWallet } from '../providers/solana/register'
import { UTXO } from '../providers/utxo'

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
        keplr: {
          value: providers.keplr,
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
