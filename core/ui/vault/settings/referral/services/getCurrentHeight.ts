import { thorchainNodeBaseUrl } from '../config'

type LastBlockEntry = { chain: string; thorchain: string }

export const getCurrentHeight = async (): Promise<number> => {
  const res = await fetch(`${thorchainNodeBaseUrl}/lastblock`)
  if (!res.ok) throw new Error(`Failed to fetch last block: ${res.status}`)

  const data: LastBlockEntry[] = await res.json()

  if (!data.length || !data[0].thorchain) {
    throw new Error('Invalid last block response')
  }

  return +data[0].thorchain
}
