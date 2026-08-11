import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getSwapProviderLogoSrc } from '@core/ui/chain/metadata/getSwapProviderLogoSrc'
import { SwapCoinItem } from '@core/ui/mpc/keysign/tx/swap/SwapCoinItem'
import { useCore } from '@core/ui/state/core'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getSwapQuoteAffiliateBps } from '@core/ui/vault/swap/affiliate/affiliateBps'
import { SwapDiscountInfo } from '@core/ui/vault/swap/form/info/SwapDiscountInfo'
import { SwapFeeRowRenderer } from '@core/ui/vault/swap/form/info/swapFeeRow'
import { SwapPriceImpactRow } from '@core/ui/vault/swap/form/info/SwapPriceImpactRow'
import { SwapProviderFeeRows } from '@core/ui/vault/swap/form/info/SwapProviderFeeRows'
import { SwapFeeFiatValue } from '@core/ui/vault/swap/form/info/SwapTotalFeeFiatValue'
import { getSwapToAmountLimit } from '@core/ui/vault/swap/keysignPayload/getSwapToAmountLimit'
import { getSwapProviderFees } from '@core/ui/vault/swap/queries/resolveSwapFees'
import { Button } from '@lib/ui/buttons/Button'
import { centerContent } from '@lib/ui/css/centerContent'
import { round } from '@lib/ui/css/round'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { SeparatedByLine } from '@lib/ui/layout/SeparatedByLine'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { SwapQuote } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { getKeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapPayload'
import { getKeysignSwapProviderName } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapProviderName'
import { KeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/KeysignSwapPayload'
import { getSwapTrackingUrl } from '@vultisig/core-mpc/swap/utils/getSwapTrackingUrl'
import { fromCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { getLastItem } from '@vultisig/lib-utils/array/getLastItem'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { getRecordUnionValue } from '@vultisig/lib-utils/record/union/getRecordUnionValue'
import { truncateId } from '@vultisig/lib-utils/string/truncate'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useTxStatusQuery } from '../../../../chain/tx/status/useTxStatusQuery'
import { useOptionalSwapQuote } from '../../state/swapQuote'
import { TxActualFeeDisplay } from '../components/TxActualFeeDisplay'
import { TxFeeRow } from '../components/TxFeeRow'
import { KeysignFeeAmount } from '../FeeAmount'
import { TxStatusTracker } from '../TxStatusTracker'
import { getSwapFeeFromPayload } from './getSwapFeeFromPayload'
import { TrackTxPrompt } from './TrackTxPrompt'

const renderFeeRow: SwapFeeRowRenderer = ({ label, value }) => (
  <TxFeeRow label={label}>
    <Text size={14} color="shy">
      {value}
    </Text>
  </TxFeeRow>
)

type GetKeysignQuoteFeesInput = {
  swapQuote: SwapQuote | undefined
  toCoin: Coin | null
  fromCoin: Coin
}

/** Itemized fees and discount context, available only while the quote is. */
const getKeysignQuoteFees = ({
  swapQuote,
  toCoin,
  fromCoin,
}: GetKeysignQuoteFeesInput) => {
  if (!swapQuote || !toCoin) return undefined

  const affiliateBps = getSwapQuoteAffiliateBps(swapQuote.discounts)

  return {
    affiliateBps,
    discounts: swapQuote.discounts,
    quote: swapQuote.quote,
    fees: getSwapProviderFees({
      quote: swapQuote.quote,
      toCoinKey: { chain: toCoin.chain, id: toCoin.id },
      toCoin,
      fromCoin,
      affiliateBps,
    }),
  }
}

export const SwapKeysignTxOverview = ({
  value,
  txHashes,
}: ValueProp<KeysignPayload> & {
  txHashes: string[]
}) => {
  const { t } = useTranslation()
  const { openUrl, goHome } = useCore()
  const vault = useCurrentVault()
  const { coin: potentialFromCoin } = value
  const swapPayload = shouldBePresent(getKeysignSwapPayload(value))
  const {
    fromAmount,
    toAmountDecimal,
    toCoin: potentialToCoin,
  } = getRecordUnionValue(swapPayload)
  const fromCoin = fromCommCoin(shouldBePresent(potentialFromCoin))
  const toCoin = potentialToCoin ? fromCommCoin(potentialToCoin) : null
  const { chain: sourceChain } = shouldBePresent(fromCoin)

  const toAmountLimit = toCoin
    ? getSwapToAmountLimit({ swapPayload, toCoin })
    : null

  const provider = getKeysignSwapProviderName(swapPayload)
  const providerLogoSrc = getSwapProviderLogoSrc(provider)

  // The initiator still holds the quote the payload was built from, so its fees
  // can be itemized exactly as the form and verify screens itemize them.
  //
  // A co-signer has only the signed payload, whose swap fee is the provider's
  // composite and carries no trace of the initiator's discount tier. Neither
  // the product's share nor its rate is recoverable there, so that path keeps
  // the neutral "Swap Fee" label instead of attributing the whole amount — or a
  // guessed percentage — to the product.
  const swapQuote = useOptionalSwapQuote()
  const quoteFees = getKeysignQuoteFees({ swapQuote, toCoin, fromCoin })
  const payloadSwapFee = getSwapFeeFromPayload(value)

  const formattedFromAmount = useMemo(() => {
    return fromChainAmount(BigInt(fromAmount), fromCoin.decimals)
  }, [fromAmount, fromCoin.decimals])

  const blockExplorerChain = matchRecordUnion<KeysignSwapPayload, Chain>(
    swapPayload,
    {
      native: ({ chain }) => chain,
      general: () => sourceChain,
    }
  )

  const mainTxHash = getLastItem(txHashes)
  const txStatusQuery = useTxStatusQuery({
    chain: blockExplorerChain,
    hash: mainTxHash,
  })
  const receipt = txStatusQuery.data?.receipt

  const trackTransaction = (tx: string) =>
    openUrl(
      getSwapTrackingUrl({
        swapPayload,
        txHash: tx,
        sourceChain,
      })
    )

  return (
    <VStack gap={36}>
      <TxStatusTracker
        chain={blockExplorerChain}
        hash={getLastItem(txHashes)}
      />
      <VStack alignItems="center" gap={8}>
        <VStack gap={8}>
          <Text centerHorizontally color="shy" size={10} height="large">
            {t('swap')}
          </Text>
          <HStack gap={8} style={{ position: 'relative' }}>
            {fromCoin && (
              <SwapCoinItem coin={fromCoin} tokenAmount={formattedFromAmount} />
            )}
            {toCoin && (
              <SwapCoinItem
                coin={toCoin}
                tokenAmount={parseFloat(toAmountDecimal)}
                caption={
                  toAmountLimit !== null
                    ? `${t('to_min_payout')}: ${formatAmount(
                        toAmountLimit,
                        toCoin
                      )}`
                    : undefined
                }
              />
            )}
            <IconWrapper alignItems="center" justifyContent="center">
              <IconInternalWrapper>
                <ChevronRightIcon />
              </IconInternalWrapper>
            </IconWrapper>
          </HStack>
        </VStack>
        <SwapInfoWrapper gap={16} fullWidth>
          <TrackTxPrompt
            title={t('transaction')}
            value={getLastItem(txHashes)}
            chain={blockExplorerChain}
            swapPayload={swapPayload}
            sourceChain={sourceChain}
          />
          {'erc20Approve' in value && (
            <TrackTxPrompt
              title={t('approval_tx')}
              value={txHashes[0]}
              chain={sourceChain}
            />
          )}
          <HStack fullWidth justifyContent="space-between" alignItems="center">
            <Text weight="500" size={14} color="shy">
              {t('provider')}
            </Text>

            <HStack alignItems="center" gap={6}>
              {providerLogoSrc ? (
                <ChainEntityIcon
                  value={providerLogoSrc}
                  style={{ fontSize: 16 }}
                />
              ) : null}
              <Text weight={500} size={14} color="contrast" cropped>
                {provider}
              </Text>
            </HStack>
          </HStack>
          <HStack fullWidth justifyContent="space-between" alignItems="center">
            <Text weight="500" size={14} color="shy">
              {t('from')}
            </Text>

            <Text weight={500} size={14} color="contrast">
              {vault.name}{' '}
              <Text cropped as="span" color="shy">
                ({truncateId(fromCoin.address)})
              </Text>
            </Text>
          </HStack>
          {toCoin && (
            <HStack
              fullWidth
              justifyContent="space-between"
              alignItems="center"
              wrap="nowrap"
            >
              <Text weight="500" size={14} color="shy">
                {t('to')}
              </Text>
              <AddressWrapper color="contrast" size={14} weight={500}>
                {truncateId(toCoin.address)}
              </AddressWrapper>
            </HStack>
          )}
          <TxFeeRow label={receipt ? t('network_fee') : t('est_network_fee')}>
            {receipt ? (
              <TxActualFeeDisplay
                chain={blockExplorerChain}
                receipt={receipt}
              />
            ) : (
              <KeysignFeeAmount keysignPayload={value} />
            )}
          </TxFeeRow>
          {quoteFees ? (
            <>
              <SwapProviderFeeRows
                renderRow={renderFeeRow}
                fees={quoteFees.fees}
                affiliateBps={quoteFees.affiliateBps}
              />
              <SwapDiscountInfo
                renderRow={renderFeeRow}
                discounts={quoteFees.discounts}
                affiliate={quoteFees.fees.affiliate}
                notional={quoteFees.fees.affiliateNotional}
                affiliateBps={quoteFees.affiliateBps}
              />
              <SwapPriceImpactRow
                renderRow={renderFeeRow}
                quote={quoteFees.quote}
              />
            </>
          ) : payloadSwapFee ? (
            <TxFeeRow label={t('swap_fee')}>
              <Text size={14} color="shy">
                <SwapFeeFiatValue value={[payloadSwapFee]} />
              </Text>
            </TxFeeRow>
          ) : null}
        </SwapInfoWrapper>
        <AnimatedVisibility
          delay={180}
          animationConfig="bottomToTop"
          overlayStyles={{ width: '100%' }}
        >
          <HStack gap={8} fullWidth>
            <Button
              kind="secondary"
              onClick={() => trackTransaction(getLastItem(txHashes))}
            >
              {t('track')}
            </Button>
            <Button data-testid="tx-success-done" onClick={goHome}>
              {t('done')}
            </Button>
          </HStack>
        </AnimatedVisibility>
      </VStack>
    </VStack>
  )
}

const AddressWrapper = styled(Text)`
  overflow: hidden;
  text-align: right;
`

const SwapInfoWrapper = styled(SeparatedByLine)`
  border-radius: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  background-color: ${getColor('foreground')};
  padding: 24px;
`

const IconWrapper = styled(HStack)`
  border-radius: 25.5px;
  padding: 7px;
  position: absolute;
  background-color: ${getColor('background')};

  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  &::before {
    content: '';
    position: absolute;
  }

  &::after {
    content: '';
    position: absolute;
  }
`

const IconInternalWrapper = styled.div`
  ${round};
  ${sameDimensions(24)};
  background: ${getColor('foregroundExtra')};
  ${centerContent};
  font-size: 16px;
  color: #718096;
`
