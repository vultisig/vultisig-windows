import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { Panel } from '@lib/ui/panel/Panel'
import { ChildrenProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'
import { useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { usePopupInput } from '../../state/input'
import { CosmosMsgType } from './interfaces'

export const TxGuard = ({ children }: ChildrenProp) => {
  const transactionPayload = usePopupInput<'sendTx'>()
  const { t } = useTranslation()

  const isUnsupportedIbcTx = useMemo(
    () =>
      matchRecordUnion(transactionPayload, {
        keysign: ({ transactionDetails }) => {
          if (!('msgPayload' in transactionDetails)) {
            return false
          }

          const { msgPayload } = transactionDetails
          if (!msgPayload) {
            return false
          }

          const { case: msgCase } = msgPayload
          if (msgCase !== CosmosMsgType.MSG_TRANSFER_URL) {
            return false
          }

          return !!msgPayload.value.memo
        },
        serialized: () => false,
      }),
    [transactionPayload]
  )

  if (isUnsupportedIbcTx) {
    return (
      <PageContent
        alignItems="center"
        gap={12}
        justifyContent="center"
        flexGrow
        scrollable
      >
        <Panel>
          <VStack alignItems="center" gap={24} justifyContent="center">
            <Text as={TriangleAlertIcon} color="danger" fontSize={36} />
            <VStack
              alignItems="center"
              gap={16}
              justifyContent="center"
              fullWidth
            >
              <Text size={17} weight={500} centerHorizontally color="danger">
                {t('ibc_transaction_not_supporting_memo_title')}
              </Text>
              <Text color="light" size={14} weight={500} centerHorizontally>
                <Trans
                  i18nKey="ibc_transaction_not_supporting_memo_desc"
                  components={{ b: <b />, br: <br /> }}
                />
              </Text>
            </VStack>
          </VStack>
        </Panel>
      </PageContent>
    )
  }

  return children
}
