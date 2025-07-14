import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'

import { blocksPerYear, thorchainNodeBaseUrl } from '../config'

type NetworkRaw = {
  tns_register_fee_rune: string
  tns_fee_per_block_rune: string
}

export const getTnsFees = async (years: number) => {
  const res = await fetch(`${thorchainNodeBaseUrl}/network`)

  if (!res.ok) throw new Error(`Failed to fetch network info: ${res.status}`)

  const { tns_register_fee_rune, tns_fee_per_block_rune }: NetworkRaw =
    await res.json()

  const register = BigInt(tns_register_fee_rune)
  const perBlock = BigInt(tns_fee_per_block_rune)
  const amount = register + perBlock * BigInt(years) * BigInt(blocksPerYear)

  const runeFee = Number(amount) / chainFeeCoin.THORChain.decimals

  return {
    runeFee,
    registerFee: Number(register) / chainFeeCoin.THORChain.decimals,
  }
}
