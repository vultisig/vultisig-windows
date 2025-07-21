import { midgardBaseUrl } from '../config'

export const getUserThorchainNames = async (
  address: string
): Promise<string[]> => {
  const res = await fetch(`${midgardBaseUrl}/thorname/rlookup/${address}`)

  if (res.status === 404) return []
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`)
  }

  return res.json()
}
