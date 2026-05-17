import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { sha256 } from '@noble/hashes/sha2.js'
import { useMutation } from '@tanstack/react-query'
import { broadcastClaimTx } from '@vultisig/core-chain/chains/cosmos/qbtc/claim/broadcastClaimTx'
import { KeysignSignature } from '@vultisig/core-mpc/keysign/KeysignSignature'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { assembleClaimTxRaw } from '../utils/buildClaimSignDoc'

export type QbtcClaimResultData = {
  txHash: string
  utxosClaimed: number
  utxosSkipped: number
  totalAmountClaimed: bigint
}

type ClaimBroadcastingPhaseProps = {
  bodyBytes: Uint8Array
  authInfoBytes: Uint8Array
  mldsaSig: KeysignSignature
  onSuccess: (result: QbtcClaimResultData) => void
  onError: (error: Error) => void
}

/** Assembles the TxRaw from the MLDSA signature and broadcasts via REST. */
export const ClaimBroadcastingPhase = ({
  bodyBytes,
  authInfoBytes,
  mldsaSig,
  onSuccess,
  onError,
}: ClaimBroadcastingPhaseProps) => {
  const { t } = useTranslation()

  const { mutate, ...state } = useMutation({
    mutationFn: async () => {
      const signature = Buffer.from(mldsaSig.der_signature, 'hex')
      const txRaw = assembleClaimTxRaw({ bodyBytes, authInfoBytes, signature })
      const txBytesBase64 = Buffer.from(txRaw).toString('base64')
      const txHash = Buffer.from(sha256(txRaw)).toString('hex').toUpperCase()
      return broadcastClaimTx({ txBytesBase64, txHash })
    },
    onSuccess: result => {
      console.log('[qbtc] claim broadcast succeeded', result)
      onSuccess(result)
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
      <PageHeader title={t('qbtc_claim_broadcasting')} hasBorder />
      <VStack
        flexGrow
        fullWidth
        alignItems="center"
        justifyContent="center"
        gap={24}
        style={{ padding: '0 24px' }}
      >
        <Spinner size={56} />
        <Text color="contrast" size={16} weight="600">
          {t('qbtc_claim_broadcasting')}
        </Text>
      </VStack>
    </>
  )
}
