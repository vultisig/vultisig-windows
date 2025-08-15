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
import { MessageKey } from '@clients/extension/src/utils/constants'
import { callPopup } from '@core/inpage-provider/popup'

import { registerWallet } from './solana/register'

export const createProviders = () => {
  const utxo = (key: string, chainId: string) => new UTXO(key, chainId)
  const cosmosProvider = Cosmos.getInstance()
  const solanaProvider = new Solana()
  registerWallet(solanaProvider)
  return {
    bitcoin: utxo(MessageKey.BITCOIN_REQUEST, 'Bitcoin_bitcoin-mainnet'),
    bitcoincash: utxo(
      MessageKey.BITCOIN_CASH_REQUEST,
      'Bitcoincash_bitcoincash'
    ),
    cosmos: cosmosProvider,
    dash: new Dash(),
    dogecoin: utxo(MessageKey.DOGECOIN_REQUEST, 'Dogecoin_dogecoin'),
    ethereum: new Ethereum(),
    keplr: XDEFIKeplrProvider.getInstance(cosmosProvider),
    litecoin: utxo(MessageKey.LITECOIN_REQUEST, 'Litecoin_litecoin'),
    mayachain: MAYAChain.getInstance(),
    plugin: {
      request: async ({ params }: { params: [{ id: string }] }) => {
        const [{ id }] = params
        const { joinUrl } = await callPopup(
          {
            pluginReshare: { pluginId: id },
          },
          { closeOnFinish: false }
        )

        return joinUrl
      },
    },
    polkadot: Polkadot.getInstance(),
    ripple: Ripple.getInstance(),
    solana: solanaProvider,
    thorchain: THORChain.getInstance(),
    zcash: utxo(MessageKey.ZCASH_REQUEST, 'Zcash_zcash'),
  }
}
