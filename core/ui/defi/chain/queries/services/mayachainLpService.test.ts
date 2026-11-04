import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  fetchMayachainLpPositions,
  getMayaLpRedeemAmounts,
} from './mayachainLpService'

// Mainnet mayanode record for an ETH.ETH position, trimmed to the fields
// the LP card reads.
const ethLpRecord = {
  asset: 'ETH.ETH',
  units: '146937624646',
  cacao_redeem_value: '149173939210',
  asset_redeem_value: '65786',
}

describe('mayachainLpService', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("reads mayanode's cacao fields and scales the asset by 1e8", async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(ethLpRecord)))
    )

    const [position] = await fetchMayachainLpPositions({
      poolAssets: ['ETH.ETH'],
      address: 'maya1me',
    })

    expect(position).toMatchObject({
      poolAsset: 'ETH.ETH',
      units: '146937624646',
      runeRedeemValue: '149173939210',
      assetRedeemValue: '65786',
    })

    const { runeAmount, assetAmount } = getMayaLpRedeemAmounts(position)

    expect(runeAmount).toBeCloseTo(14.917393921, 9)
    expect(assetAmount).toBeCloseTo(0.00065786, 12)
  })
})
