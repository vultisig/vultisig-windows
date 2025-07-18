import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { TxOverviewAmount } from '@core/ui/mpc/keysign/tx/TxOverviewAmount'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
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
  const [{ scanUnavailable }] = useCoreViewState<'keysign'>()

  const formattedToAmount = useMemo(() => {
    if (!toAmount) return null

    return fromChainAmount(BigInt(toAmount), coin.decimals)
  }, [toAmount, coin.decimals])

  return (
    <>
      <TransactionSuccessAnimation />
      <VStack gap={8}>
        {!scanUnavailable && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 12px',
              backgroundColor: 'var(--color-alertSuccess)',
              borderRadius: '16px',
              marginBottom: 4,
            }}
          >
            <CheckIcon color="white" fontSize={14} />
            <Text color="contrast" size={12} weight="500">
              {t('security_scan_passed')}
            </Text>
          </div>
        )}
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
