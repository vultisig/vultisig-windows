import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ValueProp } from '@lib/ui/props'
import { WarningBlock } from '@lib/ui/status/WarningBlock'
import { useTranslation } from 'react-i18next'

import { formatCosmosSignDataCoin } from '../cosmos/formatCosmosSignDataCoin'
import { CosmosSignDataReview } from '../cosmos/getCosmosSignDataReview'

/**
 * Shows every amount a Cosmos sign request moves, one card per transfer, read
 * from the signed data. Warns first when part of the request isn't summarized,
 * so the full details below have to be checked.
 */
export const CosmosSignDataTransfers = ({
  value,
}: ValueProp<CosmosSignDataReview>) => {
  const { t } = useTranslation()
  const { chain, transfers, hasUnsummarizedMessages } = value

  return (
    <>
      {hasUnsummarizedMessages ? (
        <WarningBlock>{t('transaction_not_fully_summarized')}</WarningBlock>
      ) : null}
      {transfers.map((transfer, index) => (
        <List key={index}>
          {transfer.recipient ? (
            <ListItem description={transfer.recipient} title={t('to')} />
          ) : null}
          <ListItem
            description={formatCosmosSignDataCoin({
              chain,
              coin: transfer.coin,
            })}
            title={t('amount')}
          />
          {transfer.memo ? (
            <ListItem description={transfer.memo} title={t('memo')} />
          ) : null}
        </List>
      ))}
    </>
  )
}
