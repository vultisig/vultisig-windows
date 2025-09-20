import { queryUrl } from '@lib/utils/query/queryUrl'

type StatusResponse = { data?: { nav_per_share?: string } }

export const fetchNavPerShare = async (
  contractId: string
): Promise<number | undefined> => {
  const url = `https://thornode-mainnet-api.bryanlabs.net/cosmwasm/wasm/v1/contract/${contractId}/smart/eyJzdGF0dXMiOiB7fX0`

  try {
    const json = await queryUrl<StatusResponse>(url)

    const s = json?.data?.nav_per_share
    const n = s == null ? undefined : Number(s)
    return Number.isFinite(n!) ? (n as number) : undefined
  } catch {
    return undefined
  }
}
