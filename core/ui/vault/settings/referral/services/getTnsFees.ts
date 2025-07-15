import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { blocksPerYear, thorchainNodeBaseUrl } from '../config'

type NetworkRaw = {
  tns_register_fee_rune: string
  tns_fee_per_block_rune: string
}

export const getTnsFees = async (years: number) => {
  const { tns_register_fee_rune, tns_fee_per_block_rune } =
    await queryUrl<NetworkRaw>(`${thorchainNodeBaseUrl}/network`)

  const register = BigInt(tns_register_fee_rune)
  const perBlock = BigInt(tns_fee_per_block_rune)
  const amount = register + perBlock * BigInt(years) * BigInt(blocksPerYear)

  const runeFee = Number(amount) / chainFeeCoin.THORChain.decimals

  return {
    runeFee,
    registerFee: Number(register) / chainFeeCoin.THORChain.decimals,
  }
}
