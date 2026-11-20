import {
  type ClaimProofResult,
  defaultProofServiceUrl,
  generateClaimProof,
} from '@vultisig/core-chain/chains/cosmos/qbtc/claim/proofService'

export type { ClaimProofResult }

type GenerateClaimProofForClaimInput = {
  signature: string
  bitcoinAddress: string
  utxos: { txid: string; vout: number }[]
  claimerAddress: string
  chainId: string
  baseUrl?: string
  broadcast: boolean
}

type GenerateClaimProofForClaimResult =
  | { kind: 'wallet'; proof: ClaimProofResult }
  | { kind: 'server'; txHash: string }

/** Sends the compact BIP-137 signature on both claim broadcast paths. */
export const generateClaimProofForClaim = async ({
  broadcast,
  baseUrl = defaultProofServiceUrl,
  ...input
}: GenerateClaimProofForClaimInput): Promise<GenerateClaimProofForClaimResult> => {
  if (broadcast) {
    const { tx_hash: txHash } = await generateClaimProof({
      ...input,
      baseUrl,
      broadcast: true,
    })
    return { kind: 'server', txHash }
  }
  const proof = await generateClaimProof({ ...input, baseUrl })
  return { kind: 'wallet', proof }
}
