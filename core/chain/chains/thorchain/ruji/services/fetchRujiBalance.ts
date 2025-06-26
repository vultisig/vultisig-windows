import { rujiGraphQlEndpoint } from '../config'

type Gql = {
  data?: {
    node?: {
      merge?: {
        accounts: {
          shares: string
          size: { amount: string }
          pool: { size: { amount: string }; shares: string }
        }[]
      }
    }
  }
}

export const fetchRujiBalance = async (thorAddr: string) => {
  const r = await fetch(rujiGraphQlEndpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      query: `
        query ($id: ID!) {
          node(id: $id) {
            ... on Account {
              merge {
                accounts {
                  shares
                  size { amount }
                  pool { size { amount } shares }
                }
              }
            }
          }}`,
      variables: { id: `Account:${thorAddr}` },
    }),
  })
  if (!r.ok) throw new Error(`RUJI query failed: ${r.status}`)

  const j = (await r.json()) as Gql
  const acc = j.data?.node?.merge?.accounts?.[0]
  if (!acc) return { ruji: 0, shares: 0, price: 0 }

  const shares = Number(acc.shares)
  const ruji = Number(acc.size.amount)
  const price = shares
    ? ruji / shares
    : Number(acc.pool.size.amount) / Number(acc.pool.shares) || 0

  return { ruji, shares, price }
}
