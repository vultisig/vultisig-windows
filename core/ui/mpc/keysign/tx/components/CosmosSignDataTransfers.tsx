import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ValueProp } from '@lib/ui/props'
import { WarningBlock } from '@lib/ui/status/WarningBlock'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { formatCosmosSignDataCoin } from '../cosmos/formatCosmosSignDataCoin'
import { CosmosSignDataReview } from '../cosmos/getCosmosSignDataReview'
import { summarizeCosmosSignDataTransfers } from '../cosmos/summarizeCosmosSignDataTransfers'

const toDescription = (lines: string[]) =>
  lines.length === 1 ? (
    lines[0]
  ) : (
    <VStack gap={4}>
      {lines.map(line => (
        <Text key={line} color="shy" size={12} weight={500}>
          {line}
        </Text>
      ))}
    </VStack>
  )

/**
 * Shows what a Cosmos sign request moves as one card read from the signed
 * data: every recipient, the total per coin, and any transfer memo. Warns
 * first when part of the request isn't summarized, so the full details below
 * have to be checked.
 */
export const CosmosSignDataTransfers = ({
  value,
}: ValueProp<CosmosSignDataReview>) => {
  const { t } = useTranslation()
  const { chain, transfers, hasUnsummarizedMessages } = value
  const { recipients, coins, memos } =
    summarizeCosmosSignDataTransfers(transfers)

  return (
    <>
      {hasUnsummarizedMessages ? (
        <WarningBlock>{t('transaction_not_fully_summarized')}</WarningBlock>
      ) : null}
      {coins.length > 0 ? (
        <List>
          {recipients.length > 0 ? (
            <ListItem description={toDescription(recipients)} title={t('to')} />
          ) : null}
          <ListItem
            description={toDescription(
              coins.map(coin => formatCosmosSignDataCoin({ chain, coin }))
            )}
            title={t('amount')}
          />
          {memos.length > 0 ? (
            <ListItem description={toDescription(memos)} title={t('memo')} />
          ) : null}
        </List>
      ) : null}
    </>
  )
}
