import { typedFetch } from '@lib/utils/fetch/typedFetch'

export type Pool = {
  asset: string // e.g. "ETH.USDC-0x..."
  status: string // 'available' | 'staged' | ...
}

export const getActivePools = () =>
  typedFetch<Pool[]>('https://midgard.ninerealms.com/v2/pools?status=available')
