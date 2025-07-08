import { rujiGraphQlEndpoint } from '../../../cosmos/thor/ruji-unmerge/config'

type MergeAccount = {
  shares: string
  size: { amount: string }
  pool: { mergeAsset: { metadata: { symbol: string } } }
}

type Gql = {
  data?: {
    node?: {
      merge?: {
        accounts: MergeAccount[]
      }
    }
  }
  errors?: unknown[]
}

export type TokenBalance = {
  symbol: string
  shares: number
  amount: number
  price: number
}

export const fetchMergeableTokenBalances = async (
  thorAddr: string
): Promise<TokenBalance[]> => {
  const result = await fetch(rujiGraphQlEndpoint, {
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
                  pool {
                    mergeAsset { metadata { symbol } }
                  }
                }
              }
            }
          }}`,
      variables: { id: btoa(`Account:${thorAddr}`) },
    }),
  })

  if (!result.ok) throw new Error(`Merge query failed: ${result.status}`)

  const json = (await result.json()) as Gql

  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`)
  }

  const accounts = json.data?.node?.merge?.accounts ?? []

  return accounts.map(account => {
    const shares = Number(account.shares)
    const amount = Number(account.size.amount)
    const price = shares ? amount / shares : 0

    return {
      symbol: account.pool.mergeAsset.metadata.symbol,
      shares,
      amount,
      price,
    }
  })
} 
