import { midgardBaseUrl } from '../config'

type AffiliateVolume = { meta: { volume: string } }

export const getAffiliateVolume = async (thorname: string) => {
  const res = await fetch(
    `${midgardBaseUrl}/history/affiliate?thorname=${thorname}`
  )
  if (!res.ok) throw new Error(`Affiliate history ${res.status}`)
  return res.json() as Promise<AffiliateVolume>
}
