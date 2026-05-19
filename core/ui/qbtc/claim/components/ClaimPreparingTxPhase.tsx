import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useMutation } from '@tanstack/react-query'
import { buildClaimTxBody } from '@vultisig/core-chain/chains/cosmos/qbtc/claim/buildClaimTx'
import { ClaimableUtxo } from '@vultisig/core-chain/chains/cosmos/qbtc/claim/ClaimableUtxo'
import {
  type ClaimProofResult,
  generateClaimProof,
} from '@vultisig/core-chain/chains/cosmos/qbtc/claim/proofService'
import { KeysignSignature } from '@vultisig/core-mpc/keysign/KeysignSignature'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { buildClaimPreSignHash } from '../utils/buildClaimSignDoc'
import {
  getQbtcAccountExists,
  getQbtcAccountInfoForClaim,
} from '../utils/getQbtcAccountInfoForClaim'

const qbtcChainId = 'qbtc-testnet'
const proofServiceRBytes = 24
const proofServiceSBytes = 32
const proofServiceBaseUrl = 'https://api.vultisig.com/qbtc-proof'

const padSigHex = (hex: string, bytes: number) =>
  hex
    .toLowerCase()
    .replace(/^0x/, '')
    .padStart(bytes * 2, '0')

type ClaimPreparingTxResult = {
  proof: ClaimProofResult
  bodyBytes: Uint8Array
  authInfoBytes: Uint8Array
  signDocHashHex: string
}

type ClaimPreparingTxPhaseProps = {
  utxos: ClaimableUtxo[]
  btcSig: KeysignSignature
  compressedPubkeyHex: string
  qbtcAddress: string
  mldsaPublicKeyHex: string
  /**
   * Called when the claimer account already exists on chain. The caller will
   * sign the returned SignDoc hash with the user's MLDSA key and broadcast
   * it directly to the QBTC REST endpoint.
   */
  onReadyToSign: (ready: ClaimPreparingTxResult) => void
  /**
   * Called when the claimer account doesn't exist on chain yet. The proof
   * service signs and broadcasts the claim itself with its own broadcaster
   * key, and the returned `tx_hash` is what landed on chain. The caller
   * just needs to wait for the tx to be included in a block.
   */
  onServerBroadcast: (txHash: string) => void
  onError: (error: Error) => void
}

type ClaimPreparingTxMutationResult =
  | { kind: 'wallet'; ready: ClaimPreparingTxResult }
  | { kind: 'server'; txHash: string }

/**
 * Calls the proof service, fetches QBTC account info, and either builds the
 * MLDSA SignDoc hash for the next MPC round (existing-account path) or hands
 * the broadcast off to the proof service entirely (first-time-claimer path).
 *
 * First-time claimers can't sign a SignDoc the chain will accept — the chain's
 * auto-assigned `account_number` is unpredictable — so we set `broadcast: true`
 * on the /prove request and the service's pre-funded broadcaster account signs
 * the cosmos tx. See btcq-org/qbtc#158.
 *
 * This step is the slow one — proof generation can take up to ~300s.
 */
export const ClaimPreparingTxPhase = ({
  utxos,
  btcSig,
  compressedPubkeyHex,
  qbtcAddress,
  mldsaPublicKeyHex,
  onReadyToSign,
  onServerBroadcast,
  onError,
}: ClaimPreparingTxPhaseProps) => {
  const { t } = useTranslation()

  const { mutate, ...state } = useMutation({
    mutationFn: async (): Promise<ClaimPreparingTxMutationResult> => {
      const accountExists = await getQbtcAccountExists({
        address: qbtcAddress,
      })

      const proof = await generateClaimProof({
        signatureR: padSigHex(btcSig.r, proofServiceRBytes),
        signatureS: padSigHex(btcSig.s, proofServiceSBytes),
        publicKey: compressedPubkeyHex,
        utxos: utxos.map(({ txid, vout }) => ({ txid, vout })),
        claimerAddress: qbtcAddress,
        chainId: qbtcChainId,
        baseUrl: proofServiceBaseUrl,
        broadcast: !accountExists,
      })

      if (!accountExists) {
        return {
          kind: 'server',
          txHash: shouldBePresent(
            proof.tx_hash,
            'proof.tx_hash on broadcast=true response'
          ),
        }
      }

      const accountInfo = await getQbtcAccountInfoForClaim({
        address: qbtcAddress,
      })

      const bodyBytes = buildClaimTxBody({
        claimer: qbtcAddress,
        broadcaster: qbtcAddress,
        utxos: utxos.map(({ txid, vout }) => ({ txid, vout })),
        proof: proof.proof,
        messageHash: proof.message_hash,
        addressHash: proof.address_hash,
        qbtcAddressHash: proof.qbtc_address_hash,
        pubKeyHashSha256: proof.pub_key_hash_sha256,
      })

      const { hash, authInfoBytes } = buildClaimPreSignHash({
        bodyBytes,
        chainId: qbtcChainId,
        accountNumber: accountInfo.accountNumber,
        mldsaPublicKey: Buffer.from(mldsaPublicKeyHex, 'hex'),
        sequence: accountInfo.sequence,
      })

      return {
        kind: 'wallet',
        ready: {
          proof,
          bodyBytes,
          authInfoBytes,
          signDocHashHex: Buffer.from(hash).toString('hex'),
        },
      }
    },
    onSuccess: result => {
      if (result.kind === 'server') {
        onServerBroadcast(result.txHash)
      } else {
        onReadyToSign(result.ready)
      }
    },
    onError,
  })

  useEffect(mutate, [mutate])

  if (state.isError) {
    return (
      <FullPageFlowErrorState
        title={t('qbtc_claim_failed')}
        error={state.error}
      />
    )
  }

  return (
    <>
      <PageHeader title={t('qbtc_claim_proving')} hasBorder />
      <VStack
        flexGrow
        fullWidth
        alignItems="center"
        justifyContent="center"
        gap={24}
        style={{ padding: '0 24px' }}
      >
        <Spinner size={56} />
        <VStack alignItems="center" gap={8}>
          <Text color="contrast" size={16} weight="600">
            {t('qbtc_claim_proving')}
          </Text>
          <Text
            color="supporting"
            size={13}
            style={{ textAlign: 'center', maxWidth: 320 }}
          >
            {t('qbtc_claim_proving_hint')}
          </Text>
        </VStack>
      </VStack>
    </>
  )
}
