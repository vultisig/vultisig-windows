import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
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
import { getQbtcAccountInfo } from '@vultisig/core-chain/chains/cosmos/qbtc/getQbtcAccountInfo'
import { KeysignSignature } from '@vultisig/core-mpc/keysign/KeysignSignature'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { buildClaimPreSignHash } from '../utils/buildClaimSignDoc'

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
  onFinish: (ready: ClaimPreparingTxResult) => void
  onError: (error: Error) => void
}

/**
 * Calls the proof service, fetches QBTC account info, and builds the MLDSA
 * SignDoc hash that will be signed in the next MPC round. This step is the
 * slow one — proof generation can take up to ~300s.
 */
export const ClaimPreparingTxPhase = ({
  utxos,
  btcSig,
  compressedPubkeyHex,
  qbtcAddress,
  mldsaPublicKeyHex,
  onFinish,
  onError,
}: ClaimPreparingTxPhaseProps) => {
  const { t } = useTranslation()

  const { mutate, ...state } = useMutation({
    mutationFn: async (): Promise<ClaimPreparingTxResult> => {
      const proof = await generateClaimProof({
        signatureR: padSigHex(btcSig.r, proofServiceRBytes),
        signatureS: padSigHex(btcSig.s, proofServiceSBytes),
        publicKey: compressedPubkeyHex,
        utxos: utxos.map(({ txid, vout }) => ({ txid, vout })),
        claimerAddress: qbtcAddress,
        chainId: qbtcChainId,
        baseUrl: proofServiceBaseUrl,
      })

      const bodyBytes = buildClaimTxBody({
        claimer: qbtcAddress,
        utxos: utxos.map(({ txid, vout }) => ({ txid, vout })),
        proof: proof.proof,
        messageHash: proof.message_hash,
        addressHash: proof.address_hash,
        qbtcAddressHash: proof.qbtc_address_hash,
      })

      const accountInfo = await getQbtcAccountInfo({ address: qbtcAddress })
      const { hash, authInfoBytes } = buildClaimPreSignHash({
        bodyBytes,
        chainId: qbtcChainId,
        accountNumber: accountInfo.accountNumber,
        mldsaPublicKey: Buffer.from(mldsaPublicKeyHex, 'hex'),
        sequence: accountInfo.sequence,
      })

      return {
        proof,
        bodyBytes,
        authInfoBytes,
        signDocHashHex: Buffer.from(hash).toString('hex'),
      }
    },
    onSuccess: onFinish,
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
      <Spinner />
      <Text
        color="supporting"
        size={12}
        style={{ textAlign: 'center', padding: '0 16px' }}
      >
        {t('qbtc_claim_proving_hint')}
      </Text>
    </>
  )
}
