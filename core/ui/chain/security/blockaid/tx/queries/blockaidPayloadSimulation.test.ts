import { Chain } from '@vultisig/core-chain/Chain'
import { getTxBlockaidSimulation } from '@vultisig/core-chain/security/blockaid/tx/simulation'
import { BlockaidSolanaSimulation } from '@vultisig/core-chain/security/blockaid/tx/simulation/api/core'
import { describe, expect, it, vi } from 'vitest'

import { getBlockaidSimulationQueryWithParsing } from './blockaidPayloadSimulation'

vi.mock('@vultisig/core-chain/security/blockaid/tx/simulation', () => ({
  getTxBlockaidSimulation: vi.fn(),
}))
const wsol = 'So11111111111111111111111111111111111111112'
const token = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
type Diff =
  BlockaidSolanaSimulation['account_summary']['account_assets_diff'][number]
const diff = (asset: Diff['asset'], raw: bigint): Diff => {
  const side = {
    raw_value: String(raw < 0n ? -raw : raw),
    value: 0,
    usd_price: 0,
    summary: '',
  }
  return {
    asset,
    asset_type: asset.type,
    in: raw > 0n ? side : null,
    out: raw < 0n ? side : null,
  }
}
const run = async (sol: bigint, receipt: bigint) => {
  vi.mocked(getTxBlockaidSimulation).mockResolvedValue({
    account_summary: {
      account_assets_diff: [
        diff({ type: 'SOL', decimals: 9, logo: '' }, sol),
        diff(
          { type: 'TOKEN', address: wsol, decimals: 9, logo: '' },
          sol > 0n ? -2039280n : 2039280n
        ),
        diff({ type: 'TOKEN', address: token, decimals: 6, logo: '' }, receipt),
      ],
    },
  })
  const query = getBlockaidSimulationQueryWithParsing({
    chain: Chain.Solana,
    data: { account_address: wsol, transactions: ['synthetic'] },
  })
  if (typeof query.queryFn !== 'function')
    throw new Error('Missing simulation query function')
  return query.queryFn({
    client: new (await import('@tanstack/react-query')).QueryClient(),
    queryKey: query.queryKey,
    signal: new AbortController().signal,
    meta: undefined,
  })
}

describe('shared approval and success Solana simulation query', () => {
  it.each([
    [1000000000n, 1000000n],
    [-1000000000n, -1000000n],
  ])(
    'rejects reversed-direction counterexamples (%s)',
    async (sol, receipt) => {
      await expect(run(sol, receipt)).rejects.toThrow('Invalid simulation data')
    }
  )
  it('shows the complete native receipt for a withdrawal', async () => {
    await expect(run(1000000000n, -1000000n)).resolves.toEqual({
      swap: {
        fromMint: token,
        toMint: wsol,
        fromAmount: 1000000n,
        toAmount: 997960720n,
        toAssetDecimal: 9,
      },
    })
  })
  it('shows the complete native spend for a deposit', async () => {
    await expect(run(-1000000000n, 1000000n)).resolves.toEqual({
      swap: {
        fromMint: wsol,
        toMint: token,
        fromAmount: 997960720n,
        toAmount: 1000000n,
        toAssetDecimal: 6,
      },
    })
  })
})
