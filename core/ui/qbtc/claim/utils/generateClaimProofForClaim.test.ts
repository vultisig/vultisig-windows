import { generateClaimProof } from '@vultisig/core-chain/chains/cosmos/qbtc/claim/proofService'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { generateClaimProofForClaim } from './generateClaimProofForClaim'

vi.mock('@vultisig/core-chain/chains/cosmos/qbtc/claim/proofService', () => ({
  defaultProofServiceUrl: 'https://proof.example',
  generateClaimProof: vi.fn(async () => ({ proof: 'ab' })),
}))

const input = {
  signature: Buffer.from('1f' + 'aa'.repeat(64), 'hex').toString('base64'),
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
    vi.mocked(generateClaimProof).mockResolvedValueOnce({
      tx_hash: 'ee'.repeat(32),
      proof: 'ab',
      pub_key_hash_sha256: 'cc'.repeat(32),
      message_text: 'claim',
      bitcoin_address: input.bitcoinAddress,
      claimer_address: input.claimerAddress,
      utxos: input.utxos,
    })

    await expect(
      generateClaimProofForClaim({ ...input, broadcast: true })
    ).resolves.toEqual({ kind: 'server', txHash: 'ee'.repeat(32) })

    expect(generateClaimProof).toHaveBeenCalledWith({
      ...input,
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
