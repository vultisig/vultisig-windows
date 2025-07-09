import { typedFetch } from '@lib/utils/fetch/typedFetch'

const BASE = 'https://thornode.ninerealms.com/thorchain'

export type ThorNameRaw = {
  name: string
  expire_block_height: string
  owner: string
  preferred_asset?: string
  affiliate_collector_rune: string
}

export const checkAvailability = async (name: string) => {
  try {
    await typedFetch<ThorNameRaw>(`${BASE}/thorname/${name}`)
    return false // if we get JSON the name exists
  } catch (e: any) {
    return e.message.includes('404')
  }
}

export const getNameInfo = (name: string) =>
  typedFetch<ThorNameRaw>(`${BASE}/thorname/${name}`)
