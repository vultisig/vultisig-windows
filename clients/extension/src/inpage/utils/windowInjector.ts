import VULTI_ICON_RAW_SVG from '@clients/extension/src/inpage/icon'
import { messengers } from '@clients/extension/src/inpage/messenger'
import { Ethereum } from '@clients/extension/src/inpage/providers/ethereum'
import { createProviders } from '@clients/extension/src/inpage/providers/providerFactory'
import { UtxoChain } from '@core/chain/Chain'
import { callPopup } from '@core/inpage-provider/popup'
import { announceProvider, EIP1193Provider } from 'mipd'
import { v4 as uuidv4 } from 'uuid'

import { MessageKey } from '../../utils/constants'
import { UTXO } from '../providers/utxo'

export const injectToWindow = () => {
  const providers = createProviders()
  const ethereumProvider = providers.ethereum

  const vultisigProvider = {
    ...providers,
    getVaults: async () => callPopup({ exportVaults: {} }),
  }

  Object.defineProperty(window, 'vultisig', {
    value: vultisigProvider,
    configurable: false,
    writable: false,
  })

  if (!window.ethereum) {
    Object.defineProperty(window, 'ethereum', {
      value: ethereumProvider,
      configurable: true,
      writable: true,
    })
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

  window.dispatchEvent(new Event('vulticonnect:inpage:ready'))

  setupContentScriptMessenger(providers)
}

function setupContentScriptMessenger(
  providers: ReturnType<typeof createProviders>
) {
  const ethereumProvider = providers.ethereum
  const phantomProvider = {
    bitcoin: new UTXO(
      MessageKey.BITCOIN_REQUEST,
      UtxoChain.Bitcoin,
      'phantom-override'
    ),
    ethereum: ethereumProvider,
    solana: providers.solana,
  }

  messengers.contentScript.reply(
    'setDefaultProvider',
    async ({
      vultisigDefaultProvider,
    }: {
      vultisigDefaultProvider: boolean
    }) => {
      if (vultisigDefaultProvider) {
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
        Object.defineProperties(window, {
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
        })
      }
    }
  )
}
