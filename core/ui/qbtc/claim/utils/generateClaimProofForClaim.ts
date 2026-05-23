import {
  type ClaimProofResult,
  defaultProofServiceUrl,
  generateClaimProof,
} from '@vultisig/core-chain/chains/cosmos/qbtc/claim/proofService'

type UtxoRef = {
  txid: string
  vout: number
}

type GenerateClaimProofForClaimInput = {
  signatureR: string
  signatureS: string
  publicKey: string
  utxos: UtxoRef[]
  claimerAddress: string
  chainId: string
  baseUrl?: string
  broadcast: boolean
}

type GenerateClaimProofForClaimResult =
  | { kind: 'wallet'; proof: ClaimProofResult }
  | { kind: 'server'; txHash: string }

const proofGenerationTimeoutMs = 300_000

const readServerBroadcastTxHash = (data: unknown): string => {
  if (
    typeof data === 'object' &&
    data !== null &&
    'tx_hash' in data &&
    typeof data.tx_hash === 'string' &&
    data.tx_hash.length > 0
  ) {
    return data.tx_hash
  }

  throw new Error('Invalid proof service broadcast response: missing tx_hash')
}

const generateServerBroadcastClaimProof = async ({
  signatureR,
  signatureS,
  publicKey,
  utxos,
  claimerAddress,
  chainId,
  baseUrl = defaultProofServiceUrl,
}: Omit<GenerateClaimProofForClaimInput, 'broadcast'>): Promise<string> => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), proofGenerationTimeoutMs)

  try {
    const response = await fetch(`${baseUrl}/prove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        signature_r: signatureR,
        signature_s: signatureS,
        public_key: publicKey,
        utxos: utxos.map(({ txid, vout }) => ({ txid, vout })),
        claimer_address: claimerAddress,
        chain_id: chainId,
        broadcast: true,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Proof service error (${response.status}): ${text}`)
    }

    return readServerBroadcastTxHash(await response.json())
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Generates a QBTC claim proof for the wallet-signing path or asks the proof
 * service to broadcast for first-time claimers.
 *
 * @param input Claim proof request, including `broadcast` to choose the server
 * broadcast path instead of the published SDK proof-only path.
 * @returns A wallet proof result or a server-broadcast transaction hash.
 */
export const generateClaimProofForClaim = async ({
  broadcast,
  ...input
}: GenerateClaimProofForClaimInput): Promise<GenerateClaimProofForClaimResult> => {
  if (broadcast) {
    return {
      kind: 'server',
      txHash: await generateServerBroadcastClaimProof(input),
    }
  }

  return {
    kind: 'wallet',
    proof: await generateClaimProof(input),
  }
}
