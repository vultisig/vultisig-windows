import { create } from '@bufbuild/protobuf'
import { UtxoChain } from '@core/chain/Chain'
import { ChainAccount } from '@core/chain/ChainAccount'
import { getDashUtxos } from '@core/chain/chains/utxo/client/getDashUtxos'
import { getUtxoAddressInfo } from '@core/chain/chains/utxo/client/getUtxoAddressInfo'
import { UtxoInfoSchema } from '@core/mpc/types/vultisig/keysign/v1/utxo_info_pb'

import { minUtxo } from '../minUtxo'

export const getUtxos = async (account: ChainAccount<UtxoChain>) => {
  if (account.chain === UtxoChain.Dash) {
    return getDashUtxos(account.address)
  }

  const { data } = await getUtxoAddressInfo(account)

  const { utxo } = data[account.address]

  return utxo
    .filter(({ block_id }) => account.chain !== UtxoChain.Dash || block_id > 0)
    .filter(({ value }) => value > minUtxo[account.chain])
    .map(({ transaction_hash, value, index }) =>
      create(UtxoInfoSchema, {
        hash: transaction_hash,
        amount: BigInt(value),
        index,
      })
    )
}
