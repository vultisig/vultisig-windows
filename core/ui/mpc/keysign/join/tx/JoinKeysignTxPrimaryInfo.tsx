import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useGetCoin } from '@core/ui/chain/coin/useGetCoin'
import { TxOverviewAmount } from '@core/ui/chain/tx/TxOverviewAmount'
import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import {
  TxOverviewChainDataRow,
  TxOverviewPrimaryRowTitle,
  TxOverviewRow,
} from '@core/ui/chain/tx/TxOverviewRow'
import { extractTokenAndAmount } from '@core/ui/chain/tx/utils/extractTokenAndAmount'
import { formatTokenAmount } from '@core/ui/chain/tx/utils/formatTokenAmount'
import { useEvmContractCallInfoQuery } from '@core/ui/chain/tx/utils/useEvmContractCallInfoQuery'
import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { useQuery } from '@tanstack/react-query'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { fromCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { capitalizeFirstLetter } from '@vultisig/lib-utils/capitalizeFirstLetter'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { assertField } from '@vultisig/lib-utils/record/assertField'
import { useTranslation } from 'react-i18next'

import { useFormatFiatAmount } from '../../../../chain/hooks/useFormatFiatAmount'
import { useKeysignFee } from '../../fee/useKeysignFee'
import { SignAminoDisplay } from '../../tx/components/SignAminoDisplay'
import { SignDirectDisplay } from '../../tx/components/SignDirectDisplay'

export const JoinKeysignTxPrimaryInfo = ({
  value,
}: ValueProp<KeysignPayload>) => {
  const { toAddress, memo, toAmount } = value

  const coin = fromCommCoin(assertField(value, 'coin'))

  const { decimals, ticker } = shouldBePresent(coin)

  const { t } = useTranslation()

  const coinPriceQuery = useCoinPriceQuery({
    coin,
  })

  const formatFiatAmount = useFormatFiatAmount()

  const feeQuery = useKeysignFee(value)

  // Decode the EVM calldata so the joiner sees the same `[icon] Approve / amount TICKER`
  // (and the unlimited-approval warning) the initiator shows on its pre-sign popup.
  // The query shares its memo-keyed react-query cache with the initiator's path,
  // so we don't refetch the 4byte signature.
  const getCoin = useGetCoin()
  const contractCallQuery = useEvmContractCallInfoQuery({
    memo,
    enabled: isChainOfKind(coin.chain, 'evm'),
  })
  const tokenPair = contractCallQuery.data
    ? extractTokenAndAmount(
        contractCallQuery.data.functionSignature,
        contractCallQuery.data.functionArguments,
        toAddress
      )
    : null
  const tokenQuery = useQuery({
    queryKey: ['resolveToken', tokenPair?.tokenAddress, coin.chain],
    queryFn: () => getCoin({ id: tokenPair!.tokenAddress, chain: coin.chain }),
    enabled: !!tokenPair,
    staleTime: Infinity,
  })
  const rawFunctionName =
    contractCallQuery.data?.functionSignature.split('(')[0]
  const decodedCall =
    tokenQuery.data && tokenPair && rawFunctionName
      ? (() => {
          const fmt = formatTokenAmount({
            rawAmount: BigInt(tokenPair.rawAmount),
            decimals: tokenQuery.data.decimals,
            functionName: rawFunctionName,
          })
          // MAX_UINT256 in a non-approval (withdraw/repay) — exact amount
          // depends on on-chain state, so skip the row entirely.
          if (!fmt.display) return null
          const amountLabel = fmt.isSentinel ? t('unlimited') : fmt.display
          return {
            coin: tokenQuery.data,
            functionName: capitalizeFirstLetter(rawFunctionName),
            display: `${amountLabel} ${tokenQuery.data.ticker}`,
            isUnlimited: fmt.isSentinel,
          }
        })()
      : null

  return (
    <>
      <TxOverviewChainDataRow>
        <TxOverviewPrimaryRowTitle>{t('from')}</TxOverviewPrimaryRowTitle>
        <span>{coin.address}</span>
      </TxOverviewChainDataRow>

      <TxOverviewChainDataRow>
        <TxOverviewPrimaryRowTitle>{t('to')}</TxOverviewPrimaryRowTitle>
        <span>{toAddress}</span>
      </TxOverviewChainDataRow>
      {memo && <TxOverviewMemo value={memo} chain={coin.chain} />}
      {decodedCall ? (
        <TxOverviewRow>
          <HStack alignItems="center" gap={8}>
            <CoinIcon coin={decodedCall.coin} style={{ fontSize: 24 }} />
            <span>{decodedCall.functionName}</span>
          </HStack>
          {decodedCall.isUnlimited ? (
            <HStack alignItems="center" gap={6}>
              <Text as={TriangleAlertIcon} color="warning" size={16} />
              <Text color="warning" weight={500}>
                {decodedCall.display}
              </Text>
            </HStack>
          ) : (
            <span>{decodedCall.display}</span>
          )}
        </TxOverviewRow>
      ) : (
        <TxOverviewAmount
          value={fromChainAmount(BigInt(toAmount), decimals)}
          ticker={ticker}
        />
      )}
      <MatchQuery
        value={coinPriceQuery}
        success={price =>
          price && !decodedCall ? (
            <TxOverviewRow>
              <span>{t('value')}</span>
              <span>
                {formatFiatAmount(
                  fromChainAmount(BigInt(toAmount), decimals) * price
                )}
              </span>
            </TxOverviewRow>
          ) : null
        }
        error={() => null}
        pending={() => null}
      />
      <MatchQuery
        value={feeQuery}
        pending={() => null}
        error={() => null}
        success={fee => {
          const { decimals, ticker } = chainFeeCoin[coin.chain]

          return (
            <TxOverviewRow>
              <span>{t('network_fee')}</span>
              <span>
                {formatAmount(fromChainAmount(fee, decimals), { ticker })}
              </span>
            </TxOverviewRow>
          )
        }}
      />
      {value.signData.case === 'signAmino' && (
        <SignAminoDisplay signAmino={value.signData.value} />
      )}
      {value.signData.case === 'signDirect' && (
        <SignDirectDisplay signDirect={value.signData.value} />
      )}
    </>
  )
}
