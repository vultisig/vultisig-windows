import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getSwapProviderLogoSrc } from '@core/ui/chain/metadata/getSwapProviderLogoSrc'
import { getTxFailureDescription } from '@core/ui/chain/tx/failure/getTxFailureDescription'
import { SwapCoinItem } from '@core/ui/mpc/keysign/tx/swap/SwapCoinItem'
import { useOpenExternalUrl } from '@core/ui/navigation/hooks/useOpenExternalUrl'
import { useCore } from '@core/ui/state/core'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import {
  getSwapFeeDisclosure,
  getSwapQuoteAffiliateBps,
} from '@core/ui/vault/swap/affiliate/affiliateBps'
import { getKeysignSwapArrivalProvider } from '@core/ui/vault/swap/arrival/swapArrivalProvider'
import {
  getSwapOutcome,
  SwapOutcome,
} from '@core/ui/vault/swap/arrival/swapOutcome'
import { useSwapArrivalStatusQuery } from '@core/ui/vault/swap/arrival/useSwapArrivalStatusQuery'
import { SwapDiscountInfo } from '@core/ui/vault/swap/form/info/SwapDiscountInfo'
import { SwapFeeRowRenderer } from '@core/ui/vault/swap/form/info/swapFeeRow'
import { SwapPriceImpactRow } from '@core/ui/vault/swap/form/info/SwapPriceImpactRow'
import { SwapProviderFeeRows } from '@core/ui/vault/swap/form/info/SwapProviderFeeRows'
import { SwapFeeFiatValue } from '@core/ui/vault/swap/form/info/SwapTotalFeeFiatValue'
import { getSwapToAmountLimit } from '@core/ui/vault/swap/keysignPayload/getSwapToAmountLimit'
import { getSwapProviderFees } from '@core/ui/vault/swap/queries/resolveSwapFees'
import { useSwapRetry } from '@core/ui/vault/swap/retry/useSwapRetry'
import { Button } from '@lib/ui/buttons/Button'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
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
import { Coin, extractCoinKey } from '@vultisig/core-chain/coin/Coin'
import { SwapQuote } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { SwapArrivalStatusResult } from '@vultisig/core-chain/swap/utils/getSwapArrivalStatus'
import { TxStatusResult } from '@vultisig/core-chain/tx/status/resolver'
import { getKeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapPayload'
import { getKeysignSwapProviderName } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapProviderName'
import { KeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/KeysignSwapPayload'
import { getKeysignLastValidBlockHeight } from '@vultisig/core-mpc/keysign/utils/getKeysignLastValidBlockHeight'
import { getSwapTrackingUrl } from '@vultisig/core-mpc/swap/utils/getSwapTrackingUrl'
import { fromCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { getLastItem } from '@vultisig/lib-utils/array/getLastItem'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { match } from '@vultisig/lib-utils/match'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { getRecordUnionValue } from '@vultisig/lib-utils/record/union/getRecordUnionValue'
import { truncateId } from '@vultisig/lib-utils/string/truncate'
import { TFunction } from 'i18next'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useTxStatusQuery } from '../../../../chain/tx/status/useTxStatusQuery'
import { useOptionalSwapQuote } from '../../state/swapQuote'
import { TxActualFeeDisplay } from '../components/TxActualFeeDisplay'
import { TxFeeRow } from '../components/TxFeeRow'
import { TxVaultSourceLabel } from '../components/TxVaultSourceLabel'
import { KeysignFeeAmount } from '../FeeAmount'
import { TxStatusView } from '../TxStatusView'
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
    disclosure: getSwapFeeDisclosure(swapQuote.discounts),
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

type GetSwapFailureDescriptionInput = {
  source: TxStatusResult | undefined
  arrival: SwapArrivalStatusResult | undefined
  t: TFunction
}

/**
 * What to print under a failed swap: the chain's own reason when the source
 * transaction reverted, the refund wording when the provider sent the funds
 * back, and the provider's message for any other terminal failure.
 */
const getSwapFailureDescription = ({
  source,
  arrival,
  t,
}: GetSwapFailureDescriptionInput): string | undefined => {
  if (source?.status === 'error' && source.failure) {
    return getTxFailureDescription({ failure: source.failure, t })
  }
  if (arrival?.status === 'refunded') {
    return t('swap_failed_refunded_description')
  }
  return arrival?.status === 'error' ? arrival.message : undefined
}

export const SwapKeysignTxOverview = ({
  value,
  txHashes,
}: ValueProp<KeysignPayload> & {
  txHashes: string[]
}) => {
  const { t } = useTranslation()
  const { goHome } = useCore()
  const openExternalUrl = useOpenExternalUrl()
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
  const lastValidBlockHeight = getKeysignLastValidBlockHeight(value)
  // The fee was paid, and any revert happened, on the chain the funds left
  // from — a native swap's THORChain/MayaChain node has never heard of the
  // source hash.
  const txStatusQuery = useTxStatusQuery({
    chain: sourceChain,
    hash: mainTxHash,
    lastValidBlockHeight,
  })
  const receipt = txStatusQuery.data?.receipt

  // A confirmed deposit only starts a native swap; the provider decides
  // whether it pays out or refunds, so its verdict is what the screen settles
  // on.
  const arrivalProvider = getKeysignSwapArrivalProvider(swapPayload)
  const arrivalQuery = useSwapArrivalStatusQuery({
    provider: arrivalProvider,
    txHash: mainTxHash,
    enabled: txStatusQuery.data?.status === 'success',
  })
  const outcome = getSwapOutcome({
    source: txStatusQuery.data,
    arrival: arrivalQuery.data,
    tracksArrival: arrivalProvider !== undefined,
  })
  const failureDescription =
    outcome === 'failed'
      ? getSwapFailureDescription({
          source: txStatusQuery.data,
          arrival: arrivalQuery.data,
          t,
        })
      : undefined

  // Only offered once the swap is over without paying out. Leaves this screen
  // behind so Back does not return to a failure the user has already moved on
  // from.
  const retrySwap = useSwapRetry({
    fromCoin: extractCoinKey(fromCoin),
    toCoin: toCoin ? extractCoinKey(toCoin) : undefined,
    replace: true,
  })
  const showTryAgain = outcome === 'failed' && !!retrySwap

  const trackTransaction = (tx: string) =>
    openExternalUrl(
      getSwapTrackingUrl({
        swapPayload,
        txHash: tx,
        sourceChain,
      })
    )

  return (
    <VStack gap={36} maxWidth={576} fullWidth>
      <TxStatusView
        status={
          txStatusQuery.isPending
            ? 'broadcasted'
            : match<SwapOutcome, 'pending' | 'success' | 'error'>(outcome, {
                pending: () => 'pending',
                success: () => 'success',
                failed: () => 'error',
              })
        }
        description={failureDescription}
      />
      <VStack alignItems="center" gap={8} fullWidth>
        <VStack gap={8} fullWidth>
          <Text centerHorizontally color="shy" size={10} height="large">
            {t('swap')}
          </Text>
          <HStack gap={8} fullWidth style={{ position: 'relative' }}>
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
          <HStack
            fullWidth
            justifyContent="space-between"
            alignItems="center"
            gap={8}
            wrap="nowrap"
          >
            <RowTitle weight="500" size={14} color="shy">
              {t('from')}
            </RowTitle>
            <TxVaultSourceLabel
              name={vault.name}
              address={`(${truncateId(fromCoin.address)})`}
            />
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
              <TxActualFeeDisplay chain={sourceChain} receipt={receipt} />
            ) : (
              <KeysignFeeAmount keysignPayload={value} />
            )}
          </TxFeeRow>
          {quoteFees ? (
            <>
              <SwapProviderFeeRows
                renderRow={renderFeeRow}
                fees={quoteFees.fees}
                disclosure={quoteFees.disclosure}
              />
              <SwapDiscountInfo
                renderRow={renderFeeRow}
                savings={quoteFees.disclosure.savings}
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
            {showTryAgain ? (
              <Button
                kind="secondary"
                data-testid="swap-try-again"
                onClick={retrySwap}
              >
                {t('try_again')}
              </Button>
            ) : (
              <Button
                kind="secondary"
                onClick={() => trackTransaction(getLastItem(txHashes))}
              >
                {t('track')}
              </Button>
            )}
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

const RowTitle = styled(Text)`
  flex-shrink: 0;
`

const SwapInfoWrapper = styled(SeparatedByLine)`
  ${borderRadius.lg};
  border: 1px solid ${getColor('foregroundExtra')};
  background-color: ${getColor('foreground')};
  padding: 24px;
`

const IconWrapper = styled(HStack)`
  ${borderRadius.pill};
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
  ${borderRadius.pill};
  ${sameDimensions(24)};
  background: ${getColor('foregroundExtra')};
  ${centerContent};
  font-size: 16px;
  color: #718096;
`
