import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { KeysignMessagePayload } from '@core/mpc/keysign/keysignPayload/KeysignMessagePayload'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { TxOverviewAmount } from '@core/ui/mpc/keysign/tx/TxOverviewAmount'
import { useBlockaidScanResult } from '@core/ui/security/hooks/useBlockaidScanResult'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TransactionSuccessAnimation } from './TransactionSuccessAnimation'

export const TxSuccess = ({
  onSeeTxDetails,
  value,
  payload,
}: ValueProp<KeysignPayload> & {
  onSeeTxDetails: () => void
  payload: KeysignMessagePayload
}) => {
  const [showSecurityCheckmark, setShowSecurityCheckmark] = useState(false)
  const { t } = useTranslation()
  const { coin: potentialCoin, toAmount } = value
  const coin = fromCommCoin(shouldBePresent(potentialCoin))
  const { scanTransaction } = useBlockaidScanResult()

  const formattedToAmount = useMemo(() => {
    if (!toAmount) return null

    return fromChainAmount(BigInt(toAmount), coin.decimals)
  }, [toAmount, coin.decimals])
  useEffect(() => {
    const checkScanResult = async () => {
      const { scanResult, scanUnavailable } = await scanTransaction(payload)
      const hasSuccessfulScan =
        scanResult?.validation?.status === 'Success' && !scanUnavailable
      setShowSecurityCheckmark(hasSuccessfulScan)
    }
    checkScanResult()
  }, [payload, scanTransaction])

  return (
    <>
      <TransactionSuccessAnimation />
      <VStack gap={8}>
        {showSecurityCheckmark && (
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
