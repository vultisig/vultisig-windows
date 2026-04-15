import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useKeysignAction } from '@core/ui/mpc/keysign/action/state/keysignAction'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useMutation } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { getCoinType } from '@vultisig/core-chain/coin/coinType'
import { getPublicKey } from '@vultisig/core-chain/publicKey/getPublicKey'

type UseQbtcClaimSignMutationInput = {
  messageHashHex: string
}

type QbtcClaimSignResult = {
  /** r-component of the ECDSA signature, 48 hex chars (24 bytes). */
  r: string
  /** s-component of the ECDSA signature, 64 hex chars (32 bytes). */
  s: string
  /** Compressed Bitcoin public key as a hex string. */
  compressedPubkeyHex: string
}

const proofServiceRBytes = 24
const proofServiceSBytes = 32

/** Validates and pads a hex string to the expected byte width for the proof service. */
const normalizeSignatureHex = (hex: string, bytes: number): string => {
  const normalized = hex.toLowerCase().replace(/^0x/, '')
  const expectedLength = bytes * 2

  if (!/^[0-9a-f]+$/.test(normalized)) {
    throw new Error('Invalid signature component: non-hex characters detected')
  }

  if (normalized.length > expectedLength) {
    throw new Error(
      `Invalid signature component length: expected <= ${expectedLength} hex chars`
    )
  }

  return normalized.padStart(expectedLength, '0')
}

/**
 * Signs a QBTC claim MessageHash using TSS/MPC with the vault's Bitcoin ECDSA key.
 * Returns the `(r, s)` signature components and the compressed public key
 * needed by the proof service.
 */
export const useQbtcClaimSignMutation = ({
  messageHashHex,
}: UseQbtcClaimSignMutationInput) => {
  const walletCore = useAssertWalletCore()
  const vault = useCurrentVault()
  const keysignAction = useKeysignAction()

  return useMutation({
    mutationFn: async (): Promise<QbtcClaimSignResult> => {
      const coinType = getCoinType({ walletCore, chain: Chain.Bitcoin })

      const [signature] = await keysignAction({
        msgs: [messageHashHex],
        signatureAlgorithm: 'ecdsa',
        coinType,
        chain: Chain.Bitcoin,
      })

      const publicKey = getPublicKey({
        walletCore,
        hexChainCode: vault.hexChainCode,
        publicKeys: vault.publicKeys,
        chainPublicKeys: vault.chainPublicKeys,
        chain: Chain.Bitcoin,
      })

      const compressedPubkeyHex = Buffer.from(publicKey.data()).toString('hex')

      return {
        r: normalizeSignatureHex(signature.r, proofServiceRBytes),
        s: normalizeSignatureHex(signature.s, proofServiceSBytes),
        compressedPubkeyHex,
      }
    },
  })
}
