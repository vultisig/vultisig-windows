import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getSwapProviderLogoSrc } from '@core/ui/chain/metadata/getSwapProviderLogoSrc'
import { KeysignFeeAmount } from '@core/ui/mpc/keysign/tx/FeeAmount'
import { getSwapFeeFromPayload } from '@core/ui/mpc/keysign/tx/swap/getSwapFeeFromPayload'
import { SwapFeeFiatValue } from '@core/ui/vault/swap/form/info/SwapTotalFeeFiatValue'
import { getSwapToAmountLimit } from '@core/ui/vault/swap/keysignPayload/getSwapToAmountLimit'
import { SwapVerifyAmount } from '@core/ui/vault/swap/verify/SwapVerify/SwapVerifyAmount'
import { SwapVerifyCard } from '@core/ui/vault/swap/verify/SwapVerify/SwapVerifyCard'
import { SwapVerifyChainChip } from '@core/ui/vault/swap/verify/SwapVerify/SwapVerifyChainChip'
import { SwapVerifyRecipient } from '@core/ui/vault/swap/verify/SwapVerify/SwapVerifyRecipient'
import { SwapVerifyRow } from '@core/ui/vault/swap/verify/SwapVerify/SwapVerifyRow'
import { SwapVerifyToDivider } from '@core/ui/vault/swap/verify/SwapVerify/SwapVerifyToDivider'
import { SwapVerifyVaultRow } from '@core/ui/vault/swap/verify/SwapVerify/SwapVerifyVaultRow'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { getKeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapPayload'
import { getKeysignSwapProviderName } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapProviderName'
import { fromCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { getRecordUnionValue } from '@vultisig/lib-utils/record/union/getRecordUnionValue'
import { useTranslation } from 'react-i18next'

import { JoinKeysignSwapTotalFee } from './JoinKeysignSwapTotalFee'

const logoSize = 14

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
      <SwapVerifyCard>
        <VStack gap={24} padding={24}>
          <Text color="supporting" size={15}>
            {t('youre_swapping')}
          </Text>
          <VStack gap={16}>
            <SwapVerifyAmount coin={fromCoin} amount={fromAmountDecimal} />
            <SwapVerifyToDivider />
            {toCoin && (
              <SwapVerifyAmount
                coin={toCoin}
                amount={toAmount}
                caption={
                  toAmountLimit === null
                    ? undefined
                    : `${t('to_min_payout')}: ${formatAmount(
                        toAmountLimit,
                        toCoin
                      )}`
                }
                extra={<SwapVerifyChainChip value={toCoin.chain} />}
              />
            )}
          </VStack>
        </VStack>
        <SwapVerifyVaultRow value={fromCoin.address} />
        <SwapVerifyRow
          label={t('provider')}
          value={
            <HStack alignItems="center" gap={6} justifyContent="end">
              {providerLogoSrc ? (
                <ChainEntityIcon
                  value={providerLogoSrc}
                  style={{ fontSize: logoSize }}
                />
              ) : null}
              <Text cropped>{provider}</Text>
            </HStack>
          }
        />
        <SwapVerifyRow
          label={t('network_fee')}
          value={<KeysignFeeAmount keysignPayload={value} />}
        />
        {swapFee && (
          <>
            <SwapVerifyRow
              label={t('swap_fee')}
              value={<SwapFeeFiatValue value={[swapFee]} />}
            />
            <SwapVerifyRow
              label={t('max_total_fee')}
              value={
                <JoinKeysignSwapTotalFee
                  keysignPayload={value}
                  swapFee={swapFee}
                />
              }
            />
          </>
        )}
      </SwapVerifyCard>
      <SwapVerifyRecipient keysignPayload={value} />
    </>
  )
}
