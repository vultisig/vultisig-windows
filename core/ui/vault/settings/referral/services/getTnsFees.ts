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
  const factor = 10 ** chainFeeCoin.THORChain.decimals
  const perYearFee = Number(perBlock * BigInt(blocksPerYear)) / factor
  const baseExtra = Number(perBlock) / factor

  const additionalYears = Math.max(0, years - 1)
  const amount =
    Number(register) / factor + baseExtra + perYearFee * additionalYears

  return {
    runeFee: amount,
    registerFee: Number(register) / factor,
    baseExtra,
    perYearFee,
  }
}
