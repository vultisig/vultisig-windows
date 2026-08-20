import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { getSwapProviderLogoSrc } from '@core/ui/chain/metadata/getSwapProviderLogoSrc'
import { KeysignFeeAmount } from '@core/ui/mpc/keysign/tx/FeeAmount'
import { getSwapFeeFromPayload } from '@core/ui/mpc/keysign/tx/swap/getSwapFeeFromPayload'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { SwapFeeFiatValue } from '@core/ui/vault/swap/form/info/SwapTotalFeeFiatValue'
import { getSwapToAmountLimit } from '@core/ui/vault/swap/keysignPayload/getSwapToAmountLimit'
import {
  ContainerWrapper,
  HorizontalLine,
  IconWrapper,
} from '@core/ui/vault/swap/verify/SwapVerify/SwapVerify.styled'
import { SwapVerifyRecipient } from '@core/ui/vault/swap/verify/SwapVerify/SwapVerifyRecipient'
import { borderRadiusPx } from '@lib/ui/css/borderRadius'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { getKeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapPayload'
import { getKeysignSwapProviderName } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapProviderName'
import { fromCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { formatWalletAddress } from '@vultisig/lib-utils/formatWalletAddress'
import { getRecordUnionValue } from '@vultisig/lib-utils/record/union/getRecordUnionValue'
import { useTranslation } from 'react-i18next'

import { JoinKeysignSwapTotalFee } from './JoinKeysignSwapTotalFee'
import { JoinSwapFiatAmount } from './JoinSwapFiatAmount'

/**
 * Joiner verify view for a swap. Carries the same cost breakdown and signing
 * vault the initiator shows, so a co-signer approves the swap knowing what it
 * pays and which vault pays it.
 *
 * The swap fee and the total that includes it render only when the payload
 * carries a fee. An initiator that predates that field leaves it empty, and a
 * co-signer holds no quote to recover it from — showing a total over gas alone
 * would misstate the cost rather than admit it is unknown.
 */
export const JoinKeysignSwapVerify = ({ value }: ValueProp<KeysignPayload>) => {
  const { t } = useTranslation()
  const vault = useCurrentVault()

  const swapPayload = shouldBePresent(
    getKeysignSwapPayload(value),
    'swap payload'
  )

  const {
    fromCoin: protobufFromCoin,
    toCoin: protobufToCoin,
    fromAmount,
    toAmountDecimal,
  } = getRecordUnionValue(swapPayload)

  const fromCoin = fromCommCoin(shouldBePresent(protobufFromCoin, 'fromCoin'))
  const toCoin = protobufToCoin ? fromCommCoin(protobufToCoin) : null

  const fromAmountDecimal = fromChainAmount(
    BigInt(fromAmount),
    fromCoin.decimals
  )
  const toAmount = Number(toAmountDecimal)
  const toAmountLimit = toCoin
    ? getSwapToAmountLimit({ swapPayload, toCoin })
    : null

  const provider = getKeysignSwapProviderName(swapPayload)
  const providerLogoSrc = getSwapProviderLogoSrc(provider)
  const swapFee = getSwapFeeFromPayload(value)

  return (
    <>
      <ContainerWrapper radius={borderRadiusPx.lg}>
        <VStack
          bgColor="foreground"
          gap={24}
          padding={24}
          radius={borderRadiusPx.lg}
        >
          <Text color="supporting" size={15}>
            {t('youre_swapping')}
          </Text>
          <VStack gap={16}>
            <HStack gap={12} alignItems="center">
              <CoinIcon coin={fromCoin} style={{ fontSize: 32 }} />
              <VStack gap={2}>
                <Text weight="500" size={17} color="contrast">
                  {formatAmount(fromAmountDecimal, fromCoin)}
                </Text>
                <JoinSwapFiatAmount
                  coin={fromCoin}
                  amount={fromAmountDecimal}
                />
              </VStack>
            </HStack>
            <HStack alignItems="center" gap={10}>
              <IconWrapper>
                <ArrowDownIcon />
              </IconWrapper>
              {t('swap_expected_payout')}
              <HorizontalLine />
            </HStack>
            {toCoin && (
              <HStack gap={12} alignItems="center">
                <CoinIcon coin={toCoin} style={{ fontSize: 32 }} />
                <VStack gap={2}>
                  <Text weight="500" size={17} color="contrast">
                    {formatAmount(toAmount, toCoin)}
                  </Text>
                  <JoinSwapFiatAmount coin={toCoin} amount={toAmount} />
                  {toAmountLimit !== null && (
                    <Text size={13} color="shy">
                      {`${t('to_min_payout')}: ${formatAmount(
                        toAmountLimit,
                        toCoin
                      )}`}
                    </Text>
                  )}
                </VStack>
              </HStack>
            )}
          </VStack>
        </VStack>
      </ContainerWrapper>
      <VStack
        bgColor="foreground"
        gap={12}
        padding={12}
        radius={borderRadiusPx.lg}
      >
        <List>
          <ListItem
            hoverable={false}
            title={t('provider')}
            extra={
              <HStack alignItems="center" gap={6}>
                {providerLogoSrc ? (
                  <ChainEntityIcon
                    value={providerLogoSrc}
                    style={{ fontSize: 16 }}
                  />
                ) : null}
                <Text color="shy">{provider}</Text>
              </HStack>
            }
          />
          <ListItem
            hoverable={false}
            title={t('network_fee')}
            extra={<KeysignFeeAmount keysignPayload={value} />}
          />
          {swapFee && (
            <>
              <ListItem
                hoverable={false}
                title={t('swap_fee')}
                extra={
                  <Text color="shy">
                    <SwapFeeFiatValue value={[swapFee]} />
                  </Text>
                }
              />
              <ListItem
                hoverable={false}
                title={t('total_fee')}
                extra={
                  <Text color="supporting">
                    <JoinKeysignSwapTotalFee
                      keysignPayload={value}
                      swapFee={swapFee}
                    />
                  </Text>
                }
              />
            </>
          )}
          <ListItem
            hoverable={false}
            title={t('vault')}
            extra={
              <Text color="contrast">
                {vault.name}{' '}
                <Text as="span" color="shy">
                  ({formatWalletAddress(fromCoin.address)})
                </Text>
              </Text>
            }
          />
        </List>
      </VStack>
      <SwapVerifyRecipient keysignPayload={value} />
    </>
  )
}
