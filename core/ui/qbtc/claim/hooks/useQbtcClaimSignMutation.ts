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
  /** r-component of the ECDSA signature as a hex string. */
  r: string
  /** s-component of the ECDSA signature as a hex string. */
  s: string
  /** Compressed Bitcoin public key as a hex string. */
  compressedPubkeyHex: string
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
        chain: Chain.Bitcoin,
      })

      const compressedPubkeyHex = Buffer.from(publicKey.data()).toString('hex')

      return {
        r: signature.r,
        s: signature.s,
        compressedPubkeyHex,
      }
    },
  })
}
