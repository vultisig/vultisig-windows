import { MessageKey } from '@clients/extension/src/utils/constants'
import { Messaging, VaultExport } from '@clients/extension/src/utils/interfaces'

import { announceProvider, EIP1193Provider } from 'mipd'
import { v4 as uuidv4 } from 'uuid'

import { NetworkKey } from './constants'
import VULTI_ICON_RAW_SVG from './icon'
import { messengers } from './messenger'
import { Cosmos } from './providers/cosmos'
import { Dash } from './providers/dash'
import { Ethereum } from './providers/ethereum'
import { MAYAChain } from './providers/maya'
import { Solana } from './providers/solana'
import { THORChain } from './providers/thorchain'
import { UTXO } from './providers/utxo'
import { shouldInjectProvider } from './utils/injectHelpers'
import { XDEFIKeplrProvider } from './providers/xdefiKeplr'

export type Callback = (
  error: Error | null,
  result?: Messaging.Chain.Response
) => void

const bitcoinProvider = new UTXO(
  MessageKey.BITCOIN_REQUEST,
  'Bitcoin_bitcoin-mainnet'
)
const bitcoinCashProvider = new UTXO(
  MessageKey.BITCOIN_CASH_REQUEST,
  'Bitcoincash_bitcoincash'
)
export const cosmosProvider = new Cosmos()
const dashProvider = new Dash()
const dogecoinProvider = new UTXO(
  MessageKey.DOGECOIN_REQUEST,
  'Dogecoin_dogecoin'
)
const ethereumProvider = new Ethereum()
const litecoinProvider = new UTXO(
  MessageKey.LITECOIN_REQUEST,
  'Litecoin_litecoin'
)
const mayachainProvider = new MAYAChain()
const solanaProvider = new Solana()
const thorchainProvider = new THORChain()
const keplrProvider = XDEFIKeplrProvider.getInstance()

const phantomProvider = {
  bitcoin: bitcoinProvider,
  ethereum: ethereumProvider,
  solana: solanaProvider,
}

const xfiProvider = {
  bitcoin: bitcoinProvider,
  bitcoincash: bitcoinCashProvider,
  cosmos: cosmosProvider,
  dogecoin: dogecoinProvider,
  ethereum: ethereumProvider,
  litecoin: litecoinProvider,
  mayachain: mayachainProvider,
  solana: solanaProvider,
  thorchain: thorchainProvider,
  keplr: keplrProvider,
  info: {
    installed: true,
    isCtrl: false,
    isVultiConnect: true,
    network: NetworkKey.MAINNET,
    version: '0.0.1',
  },
  installed: true,
}

const vultisigProvider = {
  bitcoin: bitcoinProvider,
  bitcoincash: bitcoinCashProvider,
  cosmos: cosmosProvider,
  dash: dashProvider,
  dogecoin: dogecoinProvider,
  ethereum: ethereumProvider,
  litecoin: litecoinProvider,
  maya: mayachainProvider,
  solana: solanaProvider,
  thorchain: thorchainProvider,
  getVault: async (): Promise<Messaging.GetVault.Response> => {
    return await messengers.background.send<
      Messaging.GetVault.Request,
      Messaging.GetVault.Response
    >(
      'providerRequest',
      {
        type: MessageKey.VAULT,
        message: {},
      },
      { id: uuidv4() }
    )
  },
  getVaults: async (): Promise<VaultExport[]> => {
    return await messengers.background.send<
      Messaging.GetVaults.Request,
      Messaging.GetVaults.Response
    >(
      'providerRequest',
      {
        type: MessageKey.VAULTS,
        message: {},
      },
      { id: uuidv4() }
    )
  },
}

if (shouldInjectProvider()) {
  Object.defineProperty(window, 'vultisig', {
    value: vultisigProvider,
    configurable: false,
    enumerable: false,
    writable: false,
  })

  if (!window.ethereum) {
    Object.defineProperty(window, 'ethereum', {
      value: ethereumProvider,
      configurable: true,
      enumerable: true,
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
    provider: ethereumProvider as Ethereum as EIP1193Provider,
  })

  window.dispatchEvent(new Event('vulticonnect:inpage:ready'))

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
            rdns: 'me.vultisig',
            uuid: uuidv4(),
          },
          provider: providerCopy as Ethereum as EIP1193Provider,
        })

        announceProvider({
          info: {
            icon: VULTI_ICON_RAW_SVG,
            name: 'Ctrl Wallet',
            rdns: 'io.xdefi',
            uuid: uuidv4(),
          },
          provider: providerCopy as Ethereum as EIP1193Provider,
        })

        Object.defineProperties(window, {
          ethereum: {
            get() {
              return window.vultiConnectRouter.currentProvider
            },
            set(newProvider) {
              window.vultiConnectRouter?.addProvider(newProvider)
            },
            configurable: false,
          },
          xfi: {
            value: xfiProvider,
            configurable: false,
            writable: false,
          },
          isCtrl: {
            value: true,
            configurable: false,
            writable: false,
          },
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
                window.vultiConnectRouter.currentProvider = vultiAsDefault
                  ? (window.vultisig?.ethereum ?? ethereumProvider)
                  : (window.vultiConnectRouter?.lastInjectedProvider ??
                    window.ethereum)
              },
              addProvider(provider: Ethereum) {
                if (!window.vultiConnectRouter.providers.includes(provider)) {
                  window.vultiConnectRouter.providers.push(provider)
                }
                if (ethereumProvider !== provider) {
                  window.vultiConnectRouter.lastInjectedProvider = provider
                }
              },
            },
            configurable: false,
            writable: false,
          },
          bitcoin: {
            value: bitcoinProvider,
            configurable: false,
            writable: false,
          },
          bitcoincash: {
            value: bitcoinCashProvider,
            configurable: false,
            writable: false,
          },
          cosmos: {
            value: cosmosProvider,
            configurable: false,
            writable: false,
          },
          dash: {
            value: dashProvider,
            configurable: false,
            writable: false,
          },
          dogecoin: {
            value: dogecoinProvider,
            configurable: false,
            writable: false,
          },
          litecoin: {
            value: litecoinProvider,
            configurable: false,
            writable: false,
          },
          maya: {
            value: mayachainProvider,
            configurable: false,
            writable: false,
          },
          thorchain: {
            value: thorchainProvider,
            configurable: false,
            writable: false,
          },
          phantom: {
            value: phantomProvider,
            configurable: false,
            writable: false,
          },
          keplr: {
            value: keplrProvider,
            configurable: false,
            writable: false,
          },
        })
      }
    }
  )
}
