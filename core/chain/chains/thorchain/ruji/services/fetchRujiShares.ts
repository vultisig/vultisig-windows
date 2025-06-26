import { rujiGraphQlEndpoint } from '../config'

type RujiSharesResponse = {
  data?: {
    node?: {
      merge?: { accounts: { shares: string }[] }
    }
  }
}

export const fetchRujiShares = async (thorAddr: string): Promise<number> => {
  const res = await fetch(rujiGraphQlEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query($id: ID!) {
          node(id: $id) {
            ... on Account {
              merge { accounts { shares } }
            }
          }
        }`,
      variables: { id: `Account:${thorAddr}` },
    }),
  })

  if (!res.ok) throw new Error(`RUJI query failed: ${res.status}`)

  const json = (await res.json()) as RujiSharesResponse
  const accounts = json.data?.node?.merge?.accounts ?? []

  return accounts.map(a => Number(a.shares)).reduce((sum, x) => sum + x, 0)
}
