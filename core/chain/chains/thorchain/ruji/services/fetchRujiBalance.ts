import { knownCosmosTokens } from '../../../../coin/knownTokens/cosmos'
import { rujiGraphQlEndpoint } from '../config'

type Gql = {
  data?: {
    node?: {
      merge?: {
        accounts: {
          shares: string
          size: { amount: string }
          pool: { mergeAsset: { metadata: { symbol: string } } }
        }[]
      }
    }
  }
}

export const fetchRujiBalance = async (thorAddr: string) => {
  console.log('🚀 ~ fetchRujiBalance ~ thorAddr:', thorAddr)
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

  if (!result.ok) throw new Error(`RUJI query failed: ${result.status}`)

  const json = (await result.json()) as Gql
  const accounts = json.data?.node?.merge?.accounts ?? []

  const rujiAcc = accounts.find(
    a =>
      a.pool.mergeAsset.metadata.symbol ===
      knownCosmosTokens.THORChain['x/ruji'].ticker
  )

  if (!rujiAcc) return { ruji: 0, shares: 0, price: 0 }

  const shares = Number(rujiAcc.shares)
  const ruji = Number(rujiAcc.size.amount)
  const price = shares ? ruji / shares : 0

  return { ruji, shares, price }
}
