import { generateClaimProof } from '@vultisig/core-chain/chains/cosmos/qbtc/claim/proofService'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { generateClaimProofForClaim } from './generateClaimProofForClaim'

vi.mock('@vultisig/core-chain/chains/cosmos/qbtc/claim/proofService', () => ({
  defaultProofServiceUrl: 'https://proof.example',
  generateClaimProof: vi.fn(async () => ({ proof: 'ab' })),
}))

const input = {
  signatureR: 'aa'.repeat(32),
  signatureS: 'bb'.repeat(32),
  publicKey: `02${'cc'.repeat(32)}`,
  bitcoinAddress: 'bc1qatknmeca5p0fy5decdj5704hf7prt47e0e7e9n',
  utxos: [{ txid: 'dd'.repeat(32), vout: 0 }],
  claimerAddress: 'qbtc1claimer',
  chainId: 'qbtc',
  baseUrl: 'https://proof.example',
}

describe('generateClaimProofForClaim', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('names the claimed Bitcoin address when the proof service broadcasts', async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({ tx_hash: 'ee'.repeat(32) })
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      generateClaimProofForClaim({ ...input, broadcast: true })
    ).resolves.toEqual({ kind: 'server', txHash: 'ee'.repeat(32) })

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(JSON.parse(String(init.body))).toEqual({
      signature_r: input.signatureR,
      signature_s: input.signatureS,
      public_key: input.publicKey,
      bitcoin_address: input.bitcoinAddress,
      utxos: input.utxos,
      claimer_address: input.claimerAddress,
      chain_id: input.chainId,
      broadcast: true,
    })
  })

  it('passes the claimed Bitcoin address to the proof-only request', async () => {
    await expect(
      generateClaimProofForClaim({ ...input, broadcast: false })
    ).resolves.toEqual({ kind: 'wallet', proof: { proof: 'ab' } })

    expect(generateClaimProof).toHaveBeenCalledWith(input)
  })
})
