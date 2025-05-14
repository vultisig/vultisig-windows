import { useQuery } from '@tanstack/react-query'

const TYC_STAKER_API_URL =
  'https://thornode.ninerealms.com/thorchain/tcy_staker'

export const useUnstakableTcyQuery = (runeAddress: string) =>
  useQuery({
    queryKey: ['unstakable-tcy', runeAddress],
    queryFn: async () => {
      const res = await fetch(`${TYC_STAKER_API_URL}/${runeAddress}`)
      const json = (await res.json()) as { amount?: string | null }
      return BigInt(json.amount ?? '0')
    },
  })
