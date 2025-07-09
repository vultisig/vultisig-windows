import { typedFetch } from '@lib/utils/fetch/typedFetch'

type NetworkRaw = {
  tns_register_fee_rune: string // 1e8 units
  tns_fee_per_block_rune: string
}

const blocksPerYear = 5_256_000

export const getTnsFees = async (years: number) => {
  const { tns_register_fee_rune, tns_fee_per_block_rune } =
    await typedFetch<NetworkRaw>(
      'https://thornode.ninerealms.com/thorchain/network'
    )

  const register = BigInt(tns_register_fee_rune)
  const perBlock = BigInt(tns_fee_per_block_rune)
  const amount = register + perBlock * BigInt(years) * BigInt(blocksPerYear)

  // convert 1e8 → rune
  const rune = Number(amount) / 1e8
  return { rune, register: Number(register) / 1e8 }
}
