import { create } from '@bufbuild/protobuf'
import { UtxoChain } from '@core/chain/Chain'
import { ChainAccount } from '@core/chain/ChainAccount'
import { getUtxoAddressInfo } from '@core/chain/chains/utxo/client/getUtxoAddressInfo'
import { UtxoInfoSchema } from '@core/mpc/types/vultisig/keysign/v1/utxo_info_pb'

export const getUtxos = async (account: ChainAccount<UtxoChain>) => {
  const { data } = await getUtxoAddressInfo(account)

  const { utxo } = data[account.address]

  return utxo.map(({ transaction_hash, value, index }) =>
    create(UtxoInfoSchema, {
      hash: transaction_hash,
      amount: BigInt(value),
      index,
    })
  )
}
