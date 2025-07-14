import { thorchainNodeBaseUrl } from '../config'

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
