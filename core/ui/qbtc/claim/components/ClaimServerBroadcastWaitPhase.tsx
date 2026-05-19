import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useMutation } from '@tanstack/react-query'
import { waitForClaimTxResult } from '@vultisig/core-chain/chains/cosmos/qbtc/claim/broadcastClaimTx'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { QbtcClaimResultData } from './ClaimBroadcastingPhase'

type ClaimServerBroadcastWaitPhaseProps = {
  txHash: string
  onSuccess: (result: QbtcClaimResultData) => void
  onError: (error: Error) => void
}

/**
 * Polls the chain for a proof-service-broadcast claim tx (the case where the
 * claimer account didn't exist on chain yet, so the proof service signed and
 * submitted with its own broadcaster key). Reuses the wait-and-parse helper
 * from the SDK so the success screen shows real claim numbers.
 */
export const ClaimServerBroadcastWaitPhase = ({
  txHash,
  onSuccess,
  onError,
}: ClaimServerBroadcastWaitPhaseProps) => {
  const { t } = useTranslation()

  const { mutate, ...state } = useMutation({
    mutationFn: () => waitForClaimTxResult({ txHash }),
    onSuccess,
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
