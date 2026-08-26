import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCore } from '@core/ui/state/core'
import { Button } from '@lib/ui/buttons/Button'
import { ErrorFallbackContent } from '@lib/ui/flow/ErrorFallbackContent'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { SeparatedByLine } from '@lib/ui/layout/SeparatedByLine'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Panel } from '@lib/ui/panel/Panel'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'
import { getLastItem } from '@vultisig/lib-utils/array/getLastItem'
import { getRecordUnionValue } from '@vultisig/lib-utils/record/union/getRecordUnionValue'
import { useTranslation } from 'react-i18next'

import { TxHashProvider } from '../../chain/state/txHash'
import { useTxStatusQuery } from '../../chain/tx/status/useTxStatusQuery'
import { reportBugUrl } from '../../errors/constants'
import { useFlowErrorClose } from '../../flow/FlowErrorCloseContext'
import { BroadcastRefusedError } from './assertReadyToBroadcast'
import { useKeysignMessagePayload } from './state/keysignMessagePayload'
import { RefusedBroadcastTxRow } from './tx/RefusedBroadcastTxRow'
import { SwapKeysignTxOverview } from './tx/swap/SwapKeysignTxOverview'

type KeysignBroadcastRefusalProps = {
  error: BroadcastRefusedError
}

/**
 * Shown when this device signed a transaction but refused to broadcast it
 * (e.g. a swap's inbound vault rotated during the ceremony). The transaction
 * is fully signed and co-signing devices broadcast independently, so this is
 * not a terminal failure: the chain is polled, and the moment it affirmatively
 * knows the tx (a co-signer broadcast the same signed bytes) the screen flips
 * to the regular swap success view. Until then every tx hash stays on screen
 * with a live status so the user can confirm the outcome before signing again.
 *
 * Only native swaps can be refused (the guard is a no-op for every other
 * payload), so the success view is always the swap overview.
 */
export const KeysignBroadcastRefusal = ({
  error,
}: KeysignBroadcastRefusalProps) => {
  const { t } = useTranslation()
  const { goHome, openUrl } = useCore()
  const onClose = useFlowErrorClose()
  const keysignPayload = getRecordUnionValue(
    useKeysignMessagePayload(),
    'keysign'
  )
  const chain = getKeysignChain(keysignPayload)
  const txHashes = error.txs.map(({ hash }) => hash)
  const mainTxHash = getLastItem(error.txs).hash
  const { data: txStatus } = useTxStatusQuery({ chain, hash: mainTxHash })

  // `isKnown` distinguishes "the node has indexed this hash" from "no record /
  // couldn't check": only an affirmative sighting proves another device
  // broadcast the tx. An on-chain `error` is a real failure and stays on the
  // refusal screen, where the status row reports it.
  const isBroadcast =
    txStatus?.status === 'success' ||
    (txStatus?.status === 'pending' && txStatus.isKnown === true)

  if (isBroadcast) {
    return (
      <>
        <PageHeader title={t('done')} hasBorder />
        <TxHashProvider value={mainTxHash}>
          <PageContent alignItems="center" scrollable>
            <AnimatedVisibility
              animationConfig="bottomToTop"
              overlayStyles={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              <SwapKeysignTxOverview
                txHashes={txHashes}
                value={keysignPayload}
              />
            </AnimatedVisibility>
          </PageContent>
        </TxHashProvider>
      </>
    )
  }

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('transaction')}
        hasBorder
      />
      <PageContent alignItems="center" scrollable>
        <VStack gap={16} maxWidth={576} fullWidth>
          <ErrorFallbackContent
            variant="warning"
            error={error}
            title={t('broadcast_refused')}
            description={t('broadcast_refused_description')}
            onReportBug={() => openUrl(reportBugUrl)}
          />
          <Panel>
            <SeparatedByLine gap={16}>
              {error.txs.map(({ hash }) => (
                <RefusedBroadcastTxRow key={hash} chain={chain} hash={hash} />
              ))}
            </SeparatedByLine>
          </Panel>
        </VStack>
      </PageContent>
      <PageFooter alignItems="center">
        <VStack maxWidth={576} fullWidth>
          <Button onClick={() => (onClose ? onClose(error) : goHome())}>
            {t('done')}
          </Button>
        </VStack>
      </PageFooter>
    </>
  )
}
