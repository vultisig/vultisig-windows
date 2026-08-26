import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { useLimitExpiryLabels } from '@core/ui/vault/swap/limit/useLimitExpiryLabels'
import {
  ContainerWrapper,
  HorizontalLine,
  IconWrapper,
} from '@core/ui/vault/swap/verify/SwapVerify/SwapVerify.styled'
import { SwapVerifyFiatAmount } from '@core/ui/vault/swap/verify/SwapVerify/SwapVerifyFiatAmount'
import { borderRadiusPx } from '@lib/ui/css/borderRadius'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { ClockIcon } from '@lib/ui/icons/ClockIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { KeysignLimitSwapOrder } from '@vultisig/core-mpc/keysign/swap/getKeysignLimitSwapOrder'
import { fromCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { formatWalletAddress } from '@vultisig/lib-utils/formatWalletAddress'
import { assertField } from '@vultisig/lib-utils/record/assertField'
import { useTranslation } from 'react-i18next'

import { isOwnLimitOrderDestination } from './isOwnLimitOrderDestination'
import { JoinKeysignNetworkFeeValue } from './JoinKeysignNetworkFeeValue'
import { getLimitOrderBuyCoin } from './limitOrderBuyCoin'
import { getLimitOrderUnitPriceLabel } from './limitOrderUnitPrice'
import { getThorchainAssetTicker } from './thorchainAssetTicker'

type Props = ValueProp<KeysignPayload> & {
  order: KeysignLimitSwapOrder
}

type LegProps = {
  coin: Coin | undefined
  amount: number
  ticker: string
}

/**
 * One side of the order. Falls back to amount-plus-ticker text when the coin
 * could not be resolved, so an unrecognised asset still reads truthfully
 * instead of borrowing another coin's logo and price.
 */
const Leg = ({ coin, amount, ticker }: LegProps) => (
  <HStack gap={12} alignItems="center">
    {coin ? <CoinIcon coin={coin} style={{ fontSize: 32 }} /> : null}
    <VStack gap={2}>
      <Text weight="500" size={17} color="contrast">
        {formatAmount(amount, { precision: 'high' })}{' '}
        <Text as="span" color="supporting">
          {ticker}
        </Text>
      </Text>
      {coin ? <SwapVerifyFiatAmount coin={coin} amount={amount} /> : null}
    </VStack>
  </HStack>
)

/**
 * Joiner verify view for a THORChain limit order.
 *
 * Without this the payload falls through to the generic transfer view, because
 * only ERC20-sourced limit orders carry a swap payload — a RUNE or native-gas
 * order reaches a co-signer as a transfer to an opaque address with an opaque
 * memo, showing nothing about what is being bought, where it pays out, or at
 * what floor.
 *
 * Layout follows the Figma limit-order verify card and iOS's
 * `SwapVerifyScreen`: one card with both legs, a target-price line with the
 * expiry beside a clock, then vault and network fee rows. Like iOS, the network
 * fee is the only fee shown — a resting `=<` order has no market quote to price
 * protocol or total fees from — and the payout address appears only when it is
 * not one of this vault's own addresses, mirroring iOS's external-recipient
 * rule.
 *
 * Every order-specific value is decoded from the memo the payload already
 * carries — the exact string THORChain executes — rather than from a display
 * field the initiating device supplied alongside it.
 */
export const JoinKeysignLimitOrderVerify = ({ value, order }: Props) => {
  const { t } = useTranslation()
  const expiryLabel = useLimitExpiryLabels()
  const vault = useCurrentVault()
  const coins = useCurrentVaultCoins()

  const sellCoin = fromCommCoin(assertField(value, 'coin'))
  const sellAmount = fromChainAmount(BigInt(value.toAmount), sellCoin.decimals)

  const buyTicker = getThorchainAssetTicker(order.targetAsset)
  const buyCoin = getLimitOrderBuyCoin(order)
  const buyAmount = Number(order.minimumReceivedDecimal)

  const unitPriceLabel = getLimitOrderUnitPriceLabel({
    sellAmount,
    buyAmount,
    sellTicker: sellCoin.ticker,
    buyTicker,
  })

  // Mirrors iOS's external-recipient rule: a payout to one of this vault's own
  // addresses is the normal case and stays quiet; anything else is a different
  // destination and must be shown before signing. An address the vault can't
  // confirm (buy chain not enabled here, or an unresolved asset prefix) fails
  // visible rather than silent.
  const isOwnDestination = isOwnLimitOrderDestination({
    destinationAddress: order.destinationAddress,
    targetChain: order.targetChain,
    coins,
  })

  return (
    <ContainerWrapper radius={borderRadiusPx.lg}>
      <VStack
        bgColor="foreground"
        gap={20}
        padding={24}
        radius={borderRadiusPx.lg}
      >
        <Text color="contrast" size={17} weight="500">
          {t('swap_limit_review_heading')}
        </Text>
        <VStack gap={16}>
          <Leg coin={sellCoin} amount={sellAmount} ticker={sellCoin.ticker} />
          <HStack alignItems="center" gap={10}>
            <IconWrapper>
              <ArrowDownIcon />
            </IconWrapper>
            <Text size={13} color="supporting">
              {t('to')}
            </Text>
            <HorizontalLine />
          </HStack>
          <Leg coin={buyCoin} amount={buyAmount} ticker={buyTicker} />
        </VStack>
        {unitPriceLabel ? (
          <HStack alignItems="center" gap={4}>
            <Text
              size={14}
              color="contrast"
              style={{ flex: 1 }}
            >{`${t('swap_limit_review_target_price')}: ${unitPriceLabel}`}</Text>
            {order.expiryHours ? (
              <>
                <Text size={14} color="contrast" centerVertically>
                  <ClockIcon />
                </Text>
                <Text size={14} color="contrast">
                  {expiryLabel[order.expiryHours]}
                </Text>
              </>
            ) : null}
          </HStack>
        ) : null}
        <HorizontalLine />
        <HStack
          alignItems="center"
          justifyContent="space-between"
          gap={12}
          wrap="wrap"
        >
          <Text size={14} color="shy">
            {t('vault')}
          </Text>
          <Text size={14} color="contrast">
            {vault.name}{' '}
            <Text as="span" color="shy">
              ({formatWalletAddress(sellCoin.address)})
            </Text>
          </Text>
        </HStack>
        <HorizontalLine />
        <HStack alignItems="center" justifyContent="space-between" gap={12}>
          <Text size={14} color="shy">
            {t('network_fee')}
          </Text>
          <JoinKeysignNetworkFeeValue value={value} />
        </HStack>
        {!isOwnDestination && (
          <>
            <HorizontalLine />
            <VStack gap={4}>
              <Text size={14} color="shy">
                {t('swap_limit_payout_to')}
              </Text>
              <Text
                size={13}
                color="contrast"
                style={{ wordBreak: 'break-all' }}
              >
                {order.destinationAddress}
              </Text>
            </VStack>
          </>
        )}
      </VStack>
    </ContainerWrapper>
  )
}
