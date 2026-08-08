import { useCore } from '@core/ui/state/core'
import { Button } from '@lib/ui/buttons/Button'
import { SquareArrowOutUpRightIcon } from '@lib/ui/icons/SquareArrowOutUpRightIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { getBlockExplorerUrl } from '@vultisig/core-chain/utils/getBlockExplorerUrl'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { LimitSwapTransactionRecord } from '../../../../transaction-history/core'
import { LimitOrderCancelButton } from './LimitOrderCancelButton'

type LimitOrderCancelActionsProps = {
  record: LimitSwapTransactionRecord
}

/**
 * Everything a limit order's detail screen offers around cancelling it.
 *
 * A cancel is deliberately given no history row of its own — it is a step in
 * this order's life, not a separate transfer, and this row is the single surface
 * for the whole lifecycle. That makes this screen the only place a cancel's hash
 * surfaces, so its explorer link has to live here: the fee it cost and the
 * transaction itself must stay inspectable.
 *
 * Same chain as the order by construction — a cancel is sent from the chain that
 * funded it, which is the chain the record was written against.
 */
export const LimitOrderCancelActions: FC<LimitOrderCancelActionsProps> = ({
  record,
}) => {
  const { t } = useTranslation()
  const { openUrl } = useCore()
  const { cancelTxHash } = record.data

  return (
    <VStack gap={12} alignItems="stretch">
      {cancelTxHash ? (
        <Button
          kind="secondary"
          onClick={() =>
            openUrl(
              getBlockExplorerUrl({
                chain: record.chain,
                entity: 'tx',
                value: cancelTxHash,
              })
            )
          }
          icon={<SquareArrowOutUpRightIcon />}
        >
          {t('swap_limit_cancel_view_transaction')}
        </Button>
      ) : null}
      <LimitOrderCancelButton record={record} />
    </VStack>
  )
}
