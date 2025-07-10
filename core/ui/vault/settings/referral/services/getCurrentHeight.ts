import { midgardBaseUrl } from '../constants'

type LastBlockResponse = { count: string }

export const getCurrentHeight = async (): Promise<number> => {
  const res = await fetch(`${midgardBaseUrl}/lastblock`)
  const data: LastBlockResponse = await res.json()
  return +data.count
}
