type StatusResponse = { data?: { nav_per_share?: string } }

export const fetchNavPerShare = async (
  id: string
): Promise<number | undefined> => {
  const url = `https://thornode-mainnet-api.bryanlabs.net/cosmwasm/wasm/v1/contract/${id}/smart/eyJzdGF0dXMiOiB7fX0`

  const res = await fetch(url)
  if (!res.ok) return undefined

  let json: StatusResponse
  try {
    json = (await res.json()) as StatusResponse
  } catch {
    return undefined
  }

  const s = json?.data?.nav_per_share
  const n = s != null ? Number(s) : undefined
  return Number.isFinite(n!) ? (n as number) : undefined
}
