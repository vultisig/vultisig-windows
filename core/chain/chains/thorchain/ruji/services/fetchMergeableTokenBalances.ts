import { queryUrl } from '@lib/utils/query/queryUrl'

import { rujiraGraphQlEndpoint } from '../../../cosmos/thor/rujira/config'

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

type TokenBalance = {
  symbol: string
  shares: number
  amount: number
  price: number
}

export const fetchMergeableTokenBalances = async (
  thorAddr: string
): Promise<TokenBalance[]> => {
  const { data, errors } = await queryUrl<Gql>(rujiraGraphQlEndpoint, {
    body: {
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
    },
  })

  if (errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(errors)}`)
  }

  const accounts = data?.node?.merge?.accounts ?? []

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
