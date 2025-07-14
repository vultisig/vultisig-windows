import { midgardBaseUrl } from '../config'

type Pool = {
  asset: string
  status: string
}

export const getActivePools = async (): Promise<Pool[]> => {
  const res = await fetch(`${midgardBaseUrl}/pools?status=available`)
  if (!res.ok) throw new Error(`Failed to fetch pools: ${res.status}`)
  return res.json()
}
