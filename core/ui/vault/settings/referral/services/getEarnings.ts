import { midgardBaseUrl } from '../constants'

type EarningsRaw = {
  earnings: string
}

export const getEarnings = async (name: string): Promise<EarningsRaw> => {
  const res = await fetch(`${midgardBaseUrl}/affiliate/${name}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch earnings: ${res.status}`)
  }
  return res.json()
}
