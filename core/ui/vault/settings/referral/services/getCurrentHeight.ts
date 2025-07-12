import { thorchainNodeBaseUrl } from '../constants'

type LastBlockEntry = { chain: string; lastThorchain: string }

export const getCurrentHeight = async (): Promise<number> => {
  const res = await fetch(`${thorchainNodeBaseUrl}/lastblock`)
  if (!res.ok) throw new Error(`Failed to fetch last block: ${res.status}`)

  const data: LastBlockEntry[] = await res.json()
  console.log('🚀 ~ getCurrentHeight ~ data:', data)
  const thor = data.find(e => e.chain === 'THOR')

  if (!thor) throw new Error('THORChain height not found in response')

  return +thor.lastThorchain
}
