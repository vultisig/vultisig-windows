type StatusResponse = { data?: { nav_per_share?: string } }

export const fetchNavPerShare = async (
  url: string
): Promise<number | undefined> => {
  const res = await fetch(url)
  if (!res.ok) return undefined
  const json = (await res.json()) as StatusResponse
  const s = json?.data?.nav_per_share
  return s ? Number(s) : undefined
}
