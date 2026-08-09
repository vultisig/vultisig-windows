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
}

/** Source-chain gas, shown in the fee coin alongside its fiat estimate. */
export const SwapNetworkFeeRow = ({
  renderRow,
  fee,
}: SwapNetworkFeeRowProps) => {
  const { t } = useTranslation()
  const { ticker } = chainFeeCoin[fee.chain]

  return (
    <>
      {renderRow({
        label: t('network_fee'),
        value: (
          <>
            <Text as="span" color="regular" weight="500">
              {formatAmount(fromChainAmount(fee.amount, fee.decimals), {
                ticker,
              })}
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
