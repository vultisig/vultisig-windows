import { Cosmos } from '@clients/extension/src/inpage/providers/cosmos'
import { Dash } from '@clients/extension/src/inpage/providers/dash'
import { Ethereum } from '@clients/extension/src/inpage/providers/ethereum'
import { MAYAChain } from '@clients/extension/src/inpage/providers/maya'
import { Polkadot } from '@clients/extension/src/inpage/providers/polkadot'
import { Ripple } from '@clients/extension/src/inpage/providers/ripple'
import { Solana } from '@clients/extension/src/inpage/providers/solana'
import { THORChain } from '@clients/extension/src/inpage/providers/thorchain'
import { UTXO } from '@clients/extension/src/inpage/providers/utxo'
import { XDEFIKeplrProvider } from '@clients/extension/src/inpage/providers/xdefiKeplr'
import { UtxoChain } from '@core/chain/Chain'
import { callPopup } from '@core/inpage-provider/popup'

import { registerWallet } from './solana/register'

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
      request: async ({ params }: { params: [{ id: string }] }) => {
        const [{ id }] = params
        const { joinUrl } = await callPopup({
          pluginReshare: { pluginId: id },
        })

        return joinUrl
      },
    },
    polkadot: Polkadot.getInstance(),
    ripple: Ripple.getInstance(),
    solana: solanaProvider,
    thorchain: THORChain.getInstance(),
  }
}
