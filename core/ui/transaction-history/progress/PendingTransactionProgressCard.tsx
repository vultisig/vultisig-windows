import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { WalletIcon } from '@lib/ui/icons/WalletIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import {
  areEqualCoins,
  CoinKey,
  coinKeyToString,
} from '@vultisig/core-chain/coin/Coin'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import {
  SendTransactionRecord,
  SwapTransactionRecord,
  TransactionRecord,
} from '../core'
import { TransactionHistoryTag } from '../TransactionHistoryTag'

const safeBigInt = (value: string): bigint => {
  try {
    return BigInt(value)
  } catch {
    return BigInt(0)
  }
}

const chainValues = Object.values(Chain)

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

/** Renders a send transaction progress card with from-amount. */
const SendProgressContent = ({ record }: { record: SendTransactionRecord }) => {
  const { t } = useTranslation()
  const { data } = record
  const cryptoAmount = Number(
    fromChainAmount(safeBigInt(data.amount), data.decimals)
  )
  const fiat = useFiatValue(
    { chain: record.chain, id: data.tokenId },
    cryptoAmount
  )
  const truncatedAddress = `${data.toAddress.slice(0, 8)}...${data.toAddress.slice(-6)}`

  return (
    <StepperContainer>
      <StepperLine />

      <VStack gap={16} style={{ position: 'relative' }}>
        <HStack alignItems="center" gap={8}>
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

        <HStack alignItems="center" gap={8} fullWidth>
          <StepperIcon>
            <ArrowDownIcon />
          </StepperIcon>
          <Text size={13} color="shy">
            {t('to')}
          </Text>
          <StepperDivider />
        </HStack>

        <HStack alignItems="center" gap={8}>
          <DestinationWalletIcon>
            <WalletIcon />
          </DestinationWalletIcon>
          <Text size={14} color="shy">
            {truncatedAddress}
          </Text>
        </HStack>
      </VStack>
    </StepperContainer>
  )
}

/** Renders a swap transaction progress card with from → to vertical stepper. */
const SwapProgressContent = ({ record }: { record: SwapTransactionRecord }) => {
  const { t } = useTranslation()
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
    <StepperContainer>
      <StepperLine />

      <VStack gap={16} style={{ position: 'relative' }}>
        <HStack alignItems="center" gap={8}>
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
          <VStack gap={2}>
            <Text size={16} weight={600}>
              {formatAmount(fromAmount, { precision: 'high' })} {data.fromToken}
            </Text>
            {fromFiat && (
              <Text size={12} color="supporting">
                {fromFiat}
              </Text>
            )}
          </VStack>
        </HStack>

        <HStack alignItems="center" gap={8} fullWidth>
          <StepperIcon>
            <ArrowDownIcon />
          </StepperIcon>
          <Text size={13} color="shy">
            {t('to')}
          </Text>
          <StepperDivider />
        </HStack>

        <HStack alignItems="center" gap={8}>
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
          <VStack gap={2}>
            <Text size={11} color="shy">
              {t('to_min_payout')}
            </Text>
            <Text size={16} weight={600}>
              {formatAmount(toAmount, { precision: 'high' })} {data.toToken}
            </Text>
            {toFiat && (
              <Text size={12} color="supporting">
                {toFiat}
              </Text>
            )}
          </VStack>
        </HStack>
      </VStack>

      {data.provider && <SwapProviderPill provider={data.provider} />}
    </StepperContainer>
  )
}

const SwapProviderPill = ({ provider }: { provider: string }) => {
  const { t } = useTranslation()
  const logoChain = isOneOf(provider, chainValues) ? provider : null

  return (
    <ProviderPill>
      {logoChain && (
        <ProviderIconSlot>
          <ChainEntityIcon
            value={getChainLogoSrc(logoChain)}
            style={{ fontSize: 16 }}
          />
        </ProviderIconSlot>
      )}
      <Text variant="caption" color="shy">
        {t('via')}
      </Text>
      <Text variant="caption" color="regular" weight={600}>
        {provider}
      </Text>
    </ProviderPill>
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
    <ProgressCard
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
      <TopRow>
        <TransactionHistoryTag type={record.type} />
        <InProgressBadge>
          <Text variant="caption" color="shy">
            {t('in_progress')}
          </Text>
        </InProgressBadge>
      </TopRow>

      {record.type === 'send' ? (
        <SendProgressContent record={record} />
      ) : (
        <SwapProgressContent record={record} />
      )}
    </ProgressCard>
  )
}

const ProgressCard = styled.div`
  padding: 16px;
  border-radius: 16px;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const TopRow = styled(HStack).attrs({
  alignItems: 'center',
  justifyContent: 'space-between',
})`
  width: 100%;
`

const InProgressBadge = styled.div`
  padding: 6px 12px;
  border-radius: 99px;
  background: ${({ theme }) =>
    theme.colors.foregroundExtra.withAlpha(0.5).toCssValue()};
  border: 1px solid ${getColor('foregroundExtra')};
`

const StepperContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const StepperLine = styled.div`
  position: absolute;
  left: 14px;
  top: 32px;
  bottom: 24px;
  width: 1px;
  background: ${getColor('foregroundExtra')};
`

const StepperIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${getColor('foregroundExtra')};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
  z-index: 1;
`

const ProviderPill = styled(HStack).attrs({
  alignItems: 'center',
  gap: 6,
})`
  padding: 8px 12px;
  border-radius: 12px 0 16px 0;
  background: ${getColor('buttonSecondary')};
  border-top: 1px solid ${getColor('foregroundSuper')};
  border-left: 1px solid ${getColor('foregroundSuper')};
  position: absolute;
  right: -16px;
  bottom: -16px;
`

const ProviderIconSlot = styled.div`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`

const StepperDivider = styled.div`
  flex: 1;
  height: 1px;
  border-top: 1px dashed ${getColor('foregroundExtra')};
`

const DestinationWalletIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${getColor('foregroundExtra')};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
  color: ${getColor('textShy')};
`
