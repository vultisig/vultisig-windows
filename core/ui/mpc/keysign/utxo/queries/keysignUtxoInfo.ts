import { OtherChain, UtxoChain } from '@core/chain/Chain'
import { ChainAccount } from '@core/chain/ChainAccount'
import { getCardanoUtxos } from '@core/chain/chains/cardano/utxo/getCardanoUtxos'
import { getUtxos } from '@core/chain/chains/utxo/tx/getUtxos'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { useQuery } from '@tanstack/react-query'

export const useKeysignUtxoInfo = (account: ChainAccount) => {
  return useQuery({
    queryKey: ['keysignUtxoInfo', account],
    queryFn: async () => {
      const { chain } = account
      if (isOneOf(chain, Object.values(UtxoChain))) {
        return getUtxos({ ...account, chain })
      } else if (chain === OtherChain.Cardano) {
        return getCardanoUtxos(account.address)
      }

      return null
    },
  })
}
