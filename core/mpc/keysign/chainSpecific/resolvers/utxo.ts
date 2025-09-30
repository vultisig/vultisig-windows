import { create } from '@bufbuild/protobuf'
import { UtxoChain } from '@core/chain/Chain'
import { getUtxoStats } from '@core/chain/chains/utxo/client/getUtxoStats'
import { getCoinBalance } from '@core/chain/coin/balance'
import { adjustByteFee } from '@core/chain/tx/fee/utxo/adjustByteFee'
import {
  UTXOSpecific,
  UTXOSpecificSchema,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { ChainSpecificResolver } from '../resolver'

const dustStats = 600n

const getByteFee = async (chain: UtxoChain) => {
  if (chain === UtxoChain.Zcash) {
    return 1000
  }

  const { data } = await getUtxoStats(chain)
  const rawByteFee = data.suggested_transaction_fee_per_byte_sat
  return Math.floor(rawByteFee * 2.5)
}

export const getUtxoSpecific: ChainSpecificResolver<UTXOSpecific> = async ({
  coin,
  byteFeeMultiplier = 1,
  amount,
  psbt,
}) => {
  const chain = coin.chain as UtxoChain

  const byteFee = adjustByteFee(await getByteFee(chain), byteFeeMultiplier)

  const result = create(UTXOSpecificSchema, {
    byteFee: byteFee.toString(),

    psbt: psbt?.toBase64(),
  })

  if (amount) {
    const balance = await getCoinBalance(coin)
    result.sendMaxAmount = balance - amount <= dustStats
  }

  return result
}
