import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { useKeysignFee } from '@core/ui/mpc/keysign/fee/useKeysignFee'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'

/**
 * The source chain's network fee as the joiner verify cards render it: the coin
 * amount with its fiat value stacked underneath, right-aligned. `KeysignFeeAmount`
 * shows the same two values inline, which these designs do not use.
 */
export const JoinKeysignNetworkFeeValue = ({
  value,
}: ValueProp<KeysignPayload>) => {
  const chain = getKeysignChain(value)
  const feeCoin = chainFeeCoin[chain]
  const feeQuery = useKeysignFee(value)
  const priceQuery = useCoinPriceQuery({ coin: feeCoin })
  const formatFiatAmount = useFormatFiatAmount()

  return (
    <MatchQuery
      value={feeQuery}
      pending={() => <Spinner />}
      success={feeAmount => {
        const fee = fromChainAmount(feeAmount, feeCoin.decimals)

        return (
          <VStack gap={2} alignItems="end">
            <Text size={14} color="contrast">
              {formatAmount(fee, { ticker: feeCoin.ticker })}
            </Text>
            <Text size={13} color="shy">
              <MatchQuery
                value={priceQuery}
                error={() => null}
                pending={() => <Spinner />}
                success={price => formatFiatAmount(fee * price)}
              />
            </Text>
          </VStack>
        )
      }}
    />
  )
}
