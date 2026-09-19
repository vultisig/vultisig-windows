import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'

import { useCoinPriceQuery } from '../../../chain/coin/price/queries/useCoinPriceQuery'
import { useFormatFiatAmount } from '../../../chain/hooks/useFormatFiatAmount'
import { useKeysignFee } from '../fee/useKeysignFee'

type KeysignFeeAmountProps = {
  keysignPayload: KeysignPayload
  /**
   * `inline` puts the fiat estimate beside the fee; `stacked` puts it on its
   * own line underneath, right-aligned, for the narrow value column of a
   * review sheet.
   */
  layout?: 'inline' | 'stacked'
}

/** The network fee a payload will pay, with its fiat estimate. */
export const KeysignFeeAmount = ({
  keysignPayload,
  layout = 'inline',
}: KeysignFeeAmountProps) => {
  const formatFiatAmount = useFormatFiatAmount()
  const chain = getKeysignChain(keysignPayload)

  const { decimals, ticker } = chainFeeCoin[chain]

  const feeCoinPriceQuery = useCoinPriceQuery({ coin: chainFeeCoin[chain] })

  const feeQuery = useKeysignFee(keysignPayload)

  const isStacked = layout === 'stacked'

  return (
    // Fee loading renders a block-level spinner. Use a div container so the
    // pending state never produces invalid <p><div /></p> markup.
    <Text
      as="div"
      size={14}
      centerVertically={{ gap: isStacked ? 0 : 8 }}
      style={
        isStacked
          ? { flexDirection: 'column', alignItems: 'flex-end' }
          : undefined
      }
    >
      <MatchQuery
        value={feeQuery}
        pending={() => <Spinner />}
        success={feeAmount => {
          const fee = fromChainAmount(feeAmount, decimals)

          return (
            <>
              <span>{formatAmount(fee, { ticker })}</span>
              <Text as="span" color="shy">
                <MatchQuery
                  value={feeCoinPriceQuery}
                  pending={() => <Spinner />}
                  success={price => formatFiatAmount(fee * price)}
                />
              </Text>
            </>
          )
        }}
      />
    </Text>
  )
}
