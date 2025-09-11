import { Cosmos } from '@clients/extension/src/inpage/providers/cosmos'
import { Dash } from '@clients/extension/src/inpage/providers/dash'
import {
  Ethereum,
  processSignature,
} from '@clients/extension/src/inpage/providers/ethereum'
import { MAYAChain } from '@clients/extension/src/inpage/providers/maya'
import { Polkadot } from '@clients/extension/src/inpage/providers/polkadot'
import { Ripple } from '@clients/extension/src/inpage/providers/ripple'
import { Solana } from '@clients/extension/src/inpage/providers/solana'
import { registerWallet } from '@clients/extension/src/inpage/providers/solana/register'
import { THORChain } from '@clients/extension/src/inpage/providers/thorchain'
import { UTXO } from '@clients/extension/src/inpage/providers/utxo'
import { XDEFIKeplrProvider } from '@clients/extension/src/inpage/providers/xdefiKeplr'
import { Chain, UtxoChain } from '@core/chain/Chain'
import { callPopup } from '@core/inpage-provider/popup'
import { RequestInput } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { NotImplementedError } from '@lib/utils/error/NotImplementedError'
import { getBytes, isHexString } from 'ethers'

export const createProviders = () => {
  const cosmosProvider = Cosmos.getInstance()
  const solanaProvider = new Solana()
  registerWallet(solanaProvider)
  return {
    bitcoin: new UTXO(UtxoChain.Bitcoin),
    bitcoincash: new UTXO(UtxoChain.BitcoinCash),
    dogecoin: new UTXO(UtxoChain.Dogecoin),
    litecoin: new UTXO(UtxoChain.Litecoin),
    zcash: new UTXO(UtxoChain.Zcash),
    cosmos: cosmosProvider,
    dash: new Dash(),
    ethereum: new Ethereum(),
    keplr: XDEFIKeplrProvider.getInstance(cosmosProvider),
    mayachain: MAYAChain.getInstance(),
    plugin: {
      request: async (data: RequestInput) => {
        const handlers = {
          policy_sign: async ([rawMessage, account]: [string, string]) => {
            const message = isHexString(rawMessage)
              ? getBytes(rawMessage)
              : new TextEncoder().encode(rawMessage)

            const result = await callPopup(
              {
                policySign: { message: new TextDecoder().decode(message) },
              },
              { account }
            )

            return processSignature(result)
          },
          reshare_sign: async ([{ id }]: [{ id: string }]) => {
            const { joinUrl } = await callPopup({
              pluginReshare: { pluginId: id },
            })
            return joinUrl
          },
        } as const

        if (data.method in handlers) {
          return handlers[data.method as keyof typeof handlers](
            data.params as any
          )
        }

        throw new NotImplementedError(`Plugin method ${data.method}`)
      },
    },
    polkadot: Polkadot.getInstance(),
    ripple: Ripple.getInstance(),
    solana: solanaProvider,
    thorchain: THORChain.getInstance(),
  }
}
