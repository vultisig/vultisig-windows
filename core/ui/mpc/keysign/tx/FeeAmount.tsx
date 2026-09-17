import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { getKeysignFeeCoin } from '@vultisig/core-mpc/keysign/fee/getKeysignFeeCoin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'

import { useCoinPriceQuery } from '../../../chain/coin/price/queries/useCoinPriceQuery'
import { useFormatFiatAmount } from '../../../chain/hooks/useFormatFiatAmount'
import { useKeysignFee } from '../fee/useKeysignFee'

type KeysignFeeAmountProps = {
  keysignPayload: KeysignPayload
}

export const KeysignFeeAmount = ({ keysignPayload }: KeysignFeeAmountProps) => {
  const formatFiatAmount = useFormatFiatAmount()

  // The chain's native coin, except for a gasless TON send, whose relay
  // commission is charged in the jetton being sent.
  const feeCoin = getKeysignFeeCoin(keysignPayload)
  const { decimals, ticker } = feeCoin

  const feeCoinPriceQuery = useCoinPriceQuery({ coin: feeCoin })

  const feeQuery = useKeysignFee(keysignPayload)

  return (
    // Fee loading renders a block-level spinner. Use a div container so the
    // pending state never produces invalid <p><div /></p> markup.
    <Text as="div" size={14} centerVertically={{ gap: 8 }}>
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
