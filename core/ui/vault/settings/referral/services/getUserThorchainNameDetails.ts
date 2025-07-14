import { thorchainNodeBaseUrl } from '../config'

export type NameDetails = {
  name: string
  expire_block_height: number
  owner: string
  preferred_asset: string | null
  affiliate_collector_rune: string
  aliases: { chain: string; address: string }[]
  preferred_asset_swap_threshold_rune: string
}

export const getUserThorchainNameDetails = async (
  name: string
): Promise<NameDetails> => {
  const res = await fetch(`${thorchainNodeBaseUrl}/thorname/${name}`)

  if (!res.ok) throw new Error(`Midgard ${res.status}`)
  return res.json() as Promise<NameDetails>
}
