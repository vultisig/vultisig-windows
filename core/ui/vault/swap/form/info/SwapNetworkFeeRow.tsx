import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { SwapFee } from '@vultisig/core-chain/swap/SwapFee'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'

import { SwapFeeRowRenderer } from './swapFeeRow'
import { SwapFeeFiatValue } from './SwapTotalFeeFiatValue'

type SwapNetworkFeeRowProps = {
  renderRow: SwapFeeRowRenderer
  fee: SwapFee
  /**
   * `stacked` puts the fiat estimate on its own line under the gas amount, for
   * the roomier rows of the approval card. The form's collapsed breakdown has
   * no such room and keeps both on one line.
   */
  layout?: 'inline' | 'stacked'
}

/** Source-chain gas, shown in the fee coin alongside its fiat estimate. */
export const SwapNetworkFeeRow = ({
  renderRow,
  fee,
  layout = 'inline',
}: SwapNetworkFeeRowProps) => {
  const { t } = useTranslation()
  const { ticker } = chainFeeCoin[fee.chain]

  const amount = formatAmount(fromChainAmount(fee.amount, fee.decimals), {
    ticker,
  })

  return (
    <>
      {renderRow({
        label: t('network_fee'),
        value:
          layout === 'stacked' ? (
            <VStack alignItems="end" gap={2}>
              <Text color="contrast" weight="500">
                {amount}
              </Text>
              <Text color="shy">
                ~<SwapFeeFiatValue value={[fee]} />
              </Text>
            </VStack>
          ) : (
            <>
              <Text as="span" color="regular" weight="500">
                {amount}
              </Text>{' '}
              <Text as="span" color="shy">
                (~
                <SwapFeeFiatValue value={[fee]} />)
              </Text>
            </>
          ),
      })}
    </>
  )
}
