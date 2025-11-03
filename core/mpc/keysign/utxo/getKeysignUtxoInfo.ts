import { Chain } from '@core/chain/Chain'
import { ChainAccount } from '@core/chain/ChainAccount'
import { isChainOfKind } from '@core/chain/ChainKind'
import { getCardanoUtxos } from '@core/chain/chains/cardano/utxo/getCardanoUtxos'
import { getUtxos } from '@core/chain/chains/utxo/tx/getUtxos'

export const getKeysignUtxoInfo = async ({ chain, address }: ChainAccount) => {
  if (isChainOfKind(chain, 'utxo')) {
    return getUtxos({ chain, address })
  }

  if (chain === Chain.Cardano) {
    return getCardanoUtxos(address)
  }
}
