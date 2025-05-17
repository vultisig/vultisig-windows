import { MessageKey } from '@clients/extension/src/utils/constants'

import { Cosmos } from './cosmos'
import { Dash } from './dash'
import { Ethereum } from './ethereum'
import { MAYAChain } from './maya'
import { Solana } from './solana'
import { THORChain } from './thorchain'
import { UTXO } from './utxo'
import { XDEFIKeplrProvider } from './xdefiKeplr'

export const createProviders = () => {
  const utxo = (key: string, chainId: string) => new UTXO(key, chainId)
  const cosmosProvider = Cosmos.getInstance()
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
    litecoin: utxo(MessageKey.LITECOIN_REQUEST, 'Litecoin_litecoin'),
    mayachain: MAYAChain.getInstance(),
    solana: new Solana(),
    thorchain: THORChain.getInstance(),
    keplr: XDEFIKeplrProvider.getInstance(cosmosProvider),
  }
}
