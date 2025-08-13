import { queryUrl } from '@lib/utils/query/queryUrl'

import {
  rujiraGraphQlEndpoint,
  RujiraStakeView,
} from '../../../cosmos/thor/rujira/config'

type RootData = {
  node?: {
    stakingV2?: Array<{
      bonded: {
        amount: string
        asset: { metadata?: { symbol?: string } | null }
      }
      pendingRevenue?: {
        amount: string
        asset: { metadata?: { symbol?: string } | null }
      } | null
    } | null> | null
  } | null
}
type GraphQLResponse<T> = { data?: T; errors?: unknown[] }

const encode = (s: string) =>
  typeof window === 'undefined' ? Buffer.from(s).toString('base64') : btoa(s)

export async function fetchRujiraStakeView(
  addr: string
): Promise<RujiraStakeView> {
  const variables = { id: encode(`Account:${addr}`) }
  const query = `
    query ($id: ID!) {
      node(id: $id) {
        ... on Account {
          stakingV2 {
            bonded { amount asset { metadata { symbol } } }
            pendingRevenue { amount asset { metadata { symbol } } }
          }
        }
      }
    }`

  const { data, errors } = await queryUrl<GraphQLResponse<RootData>>(
    rujiraGraphQlEndpoint,
    {
      body: { query, variables },
    }
  )

  if (errors) throw new Error(`RUJIRA GQL errors: ${JSON.stringify(errors)}`)

  const s = data?.node?.stakingV2?.[0]
  return {
    stakeAmount: s?.bonded?.amount ?? '0',
    stakeTicker: s?.bonded?.asset?.metadata?.symbol ?? 'RUJI',
    rewardsAmount: s?.pendingRevenue?.amount ?? '0',
    rewardsTicker: s?.pendingRevenue?.asset?.metadata?.symbol ?? 'USDC',
  }
}
