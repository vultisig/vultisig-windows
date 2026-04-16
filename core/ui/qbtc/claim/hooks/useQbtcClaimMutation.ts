import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useKeysignAction } from '@core/ui/mpc/keysign/action/state/keysignAction'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { sha256 } from '@noble/hashes/sha256'
import { useMutation } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { broadcastClaimTx } from '@vultisig/core-chain/chains/cosmos/qbtc/claim/broadcastClaimTx'
import { buildClaimTxBody } from '@vultisig/core-chain/chains/cosmos/qbtc/claim/buildClaimTx'
import { ClaimableUtxo } from '@vultisig/core-chain/chains/cosmos/qbtc/claim/ClaimableUtxo'
import { computeAllClaimHashes } from '@vultisig/core-chain/chains/cosmos/qbtc/claim/computeClaimHashes'
import { generateClaimProof } from '@vultisig/core-chain/chains/cosmos/qbtc/claim/proofService'
import { getQbtcAccountInfo } from '@vultisig/core-chain/chains/cosmos/qbtc/getQbtcAccountInfo'
import { getCoinType } from '@vultisig/core-chain/coin/coinType'
import { getPublicKey } from '@vultisig/core-chain/publicKey/getPublicKey'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { Dispatch, SetStateAction } from 'react'

import {
  assembleClaimTxRaw,
  buildClaimPreSignHash,
} from '../utils/buildClaimSignDoc'

/**
 * Distinct phases of the claim pipeline. Useful for rendering
 * a granular progress indicator.
 */
export const claimPhases = [
  'idle',
  'signing',
  'provingProof',
  'broadcasting',
  'done',
] as const

export type ClaimPhase = (typeof claimPhases)[number]

type ClaimResult = {
  txHash: string
  utxosClaimed: number
  utxosSkipped: number
  totalAmountClaimed: bigint
}

const qbtcChainId = 'qbtc-testnet'

type UseQbtcClaimMutationInput = {
  setPhase: Dispatch<SetStateAction<ClaimPhase>>
}

/**
 * Orchestrates the full QBTC claim pipeline:
 * hash → sign (BTC) → proof → build + sign (MLDSA) → broadcast.
 */
export const useQbtcClaimMutation = ({
  setPhase,
}: UseQbtcClaimMutationInput) => {
  const walletCore = useAssertWalletCore()
  const vault = useCurrentVault()
  const keysignAction = useKeysignAction()
  const btcAddress = useCurrentVaultAddress(Chain.Bitcoin)
  const qbtcAddress = useCurrentVaultAddress(Chain.QBTC)

  return useMutation({
    mutationFn: async (utxos: ClaimableUtxo[]): Promise<ClaimResult> => {
      const btcPublicKey = getPublicKey({
        walletCore,
        hexChainCode: vault.hexChainCode,
        publicKeys: vault.publicKeys,
        chainPublicKeys: vault.chainPublicKeys,
        chain: Chain.Bitcoin,
      })
      const compressedPubkey = btcPublicKey.data()
      const compressedPubkeyHex = Buffer.from(compressedPubkey).toString('hex')

      const { messageHash } = computeAllClaimHashes({
        btcAddress,
        compressedPubkey,
        qbtcAddress,
        chainId: qbtcChainId,
      })
      const messageHashHex = Buffer.from(messageHash).toString('hex')

      setPhase('signing')
      const btcCoinType = getCoinType({ walletCore, chain: Chain.Bitcoin })
      const [btcSignature] = await keysignAction({
        msgs: [messageHashHex],
        signatureAlgorithm: 'ecdsa',
        coinType: btcCoinType,
        chain: Chain.Bitcoin,
      })

      setPhase('provingProof')
      const proofResult = await generateClaimProof({
        signatureR: btcSignature.r.padStart(48, '0'),
        signatureS: btcSignature.s.padStart(64, '0'),
        publicKey: compressedPubkeyHex,
        utxos: utxos.map(({ txid, vout }) => ({ txid, vout })),
        claimerAddress: qbtcAddress,
        chainId: qbtcChainId,
      })
      setPhase('broadcasting')
      const bodyBytes = buildClaimTxBody({
        claimer: qbtcAddress,
        utxos: utxos.map(({ txid, vout }) => ({ txid, vout })),
        proof: proofResult.proof,
        messageHash: proofResult.message_hash,
        addressHash: proofResult.address_hash,
        qbtcAddressHash: proofResult.qbtc_address_hash,
      })

      const mldsaPublicKeyHex = shouldBePresent(
        vault.publicKeyMldsa,
        'vault.publicKeyMldsa'
      )
      const mldsaPublicKey = Buffer.from(mldsaPublicKeyHex, 'hex')
      const accountInfo = await getQbtcAccountInfo({ address: qbtcAddress })

      const { hash: preSignHash, authInfoBytes } = buildClaimPreSignHash({
        bodyBytes,
        chainId: qbtcChainId,
        accountNumber: accountInfo.accountNumber,
        mldsaPublicKey,
        sequence: accountInfo.sequence,
      })
      const preSignHashHex = Buffer.from(preSignHash).toString('hex')

      const qbtcCoinType = getCoinType({ walletCore, chain: Chain.QBTC })
      const [cosmosSignature] = await keysignAction({
        msgs: [preSignHashHex],
        signatureAlgorithm: 'mldsa',
        coinType: qbtcCoinType,
        chain: Chain.QBTC,
      })
      const signatureBytes = Buffer.from(cosmosSignature.der_signature, 'hex')

      const txRaw = assembleClaimTxRaw({
        bodyBytes,
        authInfoBytes,
        signature: signatureBytes,
      })
      const txBytesBase64 = Buffer.from(txRaw).toString('base64')
      const txHash = Buffer.from(sha256(txRaw)).toString('hex').toUpperCase()

      const response = await broadcastClaimTx({ txBytesBase64, txHash })
      setPhase('done')
      return response
    },
    onError: () => setPhase('idle'),
  })
}
