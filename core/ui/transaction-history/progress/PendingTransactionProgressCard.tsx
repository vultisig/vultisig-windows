import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { centerContent } from '@lib/ui/css/centerContent'
import { round } from '@lib/ui/css/round'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import {
  areEqualCoins,
  CoinKey,
  coinKeyToString,
} from '@vultisig/core-chain/coin/Coin'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'
import styled, { keyframes } from 'styled-components'

import {
  SendTransactionRecord,
  SwapTransactionRecord,
  TransactionRecord,
} from '../core'

const safeBigInt = (value: string): bigint => {
  try {
    return BigInt(value)
  } catch {
    return BigInt(0)
  }
}

const useFiatValue = (coin: CoinKey, cryptoAmount: number) => {
  const formatFiatAmount = useFormatFiatAmount()
  const vaultCoins = useCurrentVaultCoins()
  const vaultCoin = vaultCoins.find(c => areEqualCoins(c, coin))

  const priceQuery = useCoinPricesQuery({
    coins: [{ ...coin, priceProviderId: vaultCoin?.priceProviderId }],
    eager: false,
  })

  if (priceQuery.data != null) {
    const price = priceQuery.data[coinKeyToString(coin)]
    if (price) return formatFiatAmount(price * cryptoAmount)
  }

  return null
}

/** Renders a send transaction progress card with spinning indicator and amount. */
const SendProgressContent = ({ record }: { record: SendTransactionRecord }) => {
  const { data } = record
  const cryptoAmount = Number(
    fromChainAmount(safeBigInt(data.amount), data.decimals)
  )
  const fiat = useFiatValue(
    { chain: record.chain, id: data.tokenId },
    cryptoAmount
  )

  return (
    <ProgressCardInner gap={16} alignItems="center">
      <ProgressIndicator>
        <Spinner />
      </ProgressIndicator>
      <HStack alignItems="center" gap={8} justifyContent="center">
        {data.tokenLogo && (
          <CoinIcon
            coin={{
              chain: record.chain,
              id: data.tokenId,
              logo: data.tokenLogo,
            }}
            style={{ fontSize: 28 }}
          />
        )}
        <VStack gap={2}>
          <Text size={16} weight={600}>
            {formatAmount(cryptoAmount, { precision: 'high' })} {data.token}
          </Text>
          {fiat && (
            <Text size={12} color="supporting">
              {fiat}
            </Text>
          )}
        </VStack>
      </HStack>
    </ProgressCardInner>
  )
}

/** Renders a swap transaction progress card with side-by-side coin cards. */
const SwapProgressContent = ({ record }: { record: SwapTransactionRecord }) => {
  const { data } = record
  const fromAmount = Number(
    fromChainAmount(safeBigInt(data.fromAmount), data.fromDecimals)
  )
  const toAmount = Number(
    fromChainAmount(safeBigInt(data.toAmount), data.toDecimals)
  )
  const fromFiat = useFiatValue(
    { chain: data.fromChain, id: data.fromTokenId },
    fromAmount
  )
  const toFiat = useFiatValue(
    { chain: data.toChain, id: data.toTokenId },
    toAmount
  )

  return (
    <ProgressCardInner gap={12} alignItems="center">
      <ProgressIndicator>
        <Spinner />
      </ProgressIndicator>
      <HStack gap={8} style={{ position: 'relative', width: '100%' }}>
        <SwapCoinCard gap={8} alignItems="center">
          {data.fromTokenLogo && (
            <CoinIcon
              coin={{
                chain: data.fromChain,
                id: data.fromTokenId,
                logo: data.fromTokenLogo,
              }}
              style={{ fontSize: 28 }}
            />
          )}
          <VStack alignItems="center" gap={2}>
            <Text size={12} weight={500} centerHorizontally>
              {formatAmount(fromAmount, { precision: 'high' })} {data.fromToken}
            </Text>
            {fromFiat && (
              <Text size={10} color="supporting" centerHorizontally>
                {fromFiat}
              </Text>
            )}
          </VStack>
        </SwapCoinCard>

        <ChevronWrapper alignItems="center" justifyContent="center">
          <ChevronCircle>
            <ChevronRightIcon />
          </ChevronCircle>
        </ChevronWrapper>

        <SwapCoinCard gap={8} alignItems="center">
          {data.toTokenLogo && (
            <CoinIcon
              coin={{
                chain: data.toChain,
                id: data.toTokenId,
                logo: data.toTokenLogo,
              }}
              style={{ fontSize: 28 }}
            />
          )}
          <VStack alignItems="center" gap={2}>
            <Text size={12} weight={500} centerHorizontally>
              {formatAmount(toAmount, { precision: 'high' })} {data.toToken}
            </Text>
            {toFiat && (
              <Text size={10} color="supporting" centerHorizontally>
                {toFiat}
              </Text>
            )}
          </VStack>
        </SwapCoinCard>
      </HStack>
    </ProgressCardInner>
  )
}

type PendingTransactionProgressCardProps = {
  record: TransactionRecord
}

/** Displays a progress card for a pending/broadcasted transaction above the transaction list. */
export const PendingTransactionProgressCard = ({
  record,
}: PendingTransactionProgressCardProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  const handleClick = () =>
    navigate({ id: 'transactionDetail', state: { id: record.id } })

  return (
    <ProgressCardWrapper
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <Text size={12} color="supporting" weight={500} centerHorizontally>
        {t('pending')}
      </Text>
      {record.type === 'send' ? (
        <SendProgressContent record={record} />
      ) : (
        <SwapProgressContent record={record} />
      )}
    </ProgressCardWrapper>
  )
}

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`

const ProgressCardWrapper = styled.div`
  padding: 16px;
  border-radius: 16px;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  cursor: pointer;
  animation: ${pulse} 2s ease-in-out infinite;
`

const ProgressCardInner = styled(VStack)`
  width: 100%;
`

const ProgressIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`

const SwapCoinCard = styled(VStack)`
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 12px;
  flex: 1;
  padding: 16px 12px;
`

const ChevronWrapper = styled(HStack)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  border-radius: 50%;
  padding: 5px;
  background-color: ${getColor('background')};
`

const ChevronCircle = styled.div`
  ${round};
  ${sameDimensions(20)};
  ${centerContent};
  background: ${getColor('foregroundExtra')};
  font-size: 14px;
  color: #718096;
`
