import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { TxOverviewAmount } from '@core/ui/mpc/keysign/tx/TxOverviewAmount'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ValueProp } from '@lib/ui/props'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { TransactionSuccessAnimation } from './TransactionSuccessAnimation'

export const TxSuccess = ({
  onSeeTxDetails,
  value,
}: ValueProp<KeysignPayload> & {
  onSeeTxDetails: () => void
}) => {
  const { t } = useTranslation()
  const { coin: potentialCoin, toAmount } = value
  const coin = fromCommCoin(shouldBePresent(potentialCoin))

  const formattedToAmount = useMemo(() => {
    if (!toAmount) return null

    return fromChainAmount(BigInt(toAmount), coin.decimals)
  }, [toAmount, coin.decimals])

  return (
    <>
      <TransactionSuccessAnimation />
      <VStack gap={8}>
        {formattedToAmount !== null && (
          <TxOverviewAmount amount={formattedToAmount} value={coin} />
        )}
        <List>
          <ListItem
            onClick={onSeeTxDetails}
            title={t('transaction_details')}
            hoverable
            showArrow
          />
        </List>
      </VStack>
    </>
  )
}
