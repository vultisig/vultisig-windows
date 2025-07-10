import { thorchainNodeBaseUrl } from '../constants'

export type ThorNameRaw = {
  name: string
  expire_block_height: string
  owner: string
  preferred_asset?: string
  affiliate_collector_rune: string
}

export const getNameInfo = async (name: string): Promise<ThorNameRaw> => {
  const res = await fetch(`${thorchainNodeBaseUrl}/thorname/${name}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`)
  }
  return res.json()
}

export const checkAvailability = async (name: string): Promise<boolean> => {
  try {
    const res = await fetch(`${thorchainNodeBaseUrl}/thorname/${name}`)

    if (!res.ok) return true

    const data = await res.json()

    return !('code' in data && data.code === 0)
  } catch {
    return true
  }
}
