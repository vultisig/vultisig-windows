import { SwapCoinItem } from '@core/ui/mpc/keysign/tx/swap/SwapCoinItem'
import { useCore } from '@core/ui/state/core'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { SwapFeeFiatValue } from '@core/ui/vault/swap/form/info/SwapTotalFeeFiatValue'
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
import { CoinKey } from '@vultisig/core-chain/coin/Coin'
import { GeneralSwapTx } from '@vultisig/core-chain/swap/general/GeneralSwapQuote'
import { getNativeSwapDecimals } from '@vultisig/core-chain/swap/native/utils/getNativeSwapDecimals'
import {
  SwapQuote,
  SwapQuoteResult,
} from '@vultisig/core-chain/swap/quote/SwapQuote'
import { SwapFee } from '@vultisig/core-chain/swap/SwapFee'
import { getKeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapPayload'
import { getKeysignSwapProviderName } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapProviderName'
import { KeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/KeysignSwapPayload'
import { getSwapTrackingUrl } from '@vultisig/core-mpc/swap/utils/getSwapTrackingUrl'
import { fromCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { getLastItem } from '@vultisig/lib-utils/array/getLastItem'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
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

type GetSwapFeeFromQuoteInput = {
  swapQuote: SwapQuote
  fromCoin: CoinKey & { decimals: number }
  toCoinKey: CoinKey
}

const getSwapFeeFromQuote = ({
  swapQuote,
  fromCoin,
  toCoinKey,
}: GetSwapFeeFromQuoteInput): SwapFee | undefined =>
  matchRecordUnion<SwapQuoteResult, SwapFee | undefined>(swapQuote.quote, {
    native: ({ fees }) => ({
      ...toCoinKey,
      amount: BigInt(fees.total),
      decimals: getNativeSwapDecimals(toCoinKey),
    }),
    general: ({ tx }) =>
      matchRecordUnion<GeneralSwapTx, SwapFee | undefined>(tx, {
        evm: ({ affiliateFee }) => affiliateFee,
        solana: ({ swapFee }) => swapFee,
        // Deposit-channel transfers (Chainflip etc.) carry no affiliate-fee
        // metadata on the SwapQuote; the displayed swap fee for these falls
        // back to the keysign payload's `swap_fee` when present.
        transfer: () => undefined,
        cowswap_order: ({ feeAmount }) => {
          const amount = BigInt(feeAmount)

          return amount > 0n
            ? {
                chain: fromCoin.chain,
                id: fromCoin.id,
                amount,
                decimals: fromCoin.decimals,
              }
            : undefined
        },
      }),
  })

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

  // Prefer the swap fee carried in the keysign payload (works for both
  // initiator and cosigner). Fall back to the SwapQuote provider for older
  // payloads built before the SDK populated the swap-fee fields — only the
  // initiator has the quote in scope.
  const swapQuote = useOptionalSwapQuote()
  const swapFeeFromPayload = getSwapFeeFromPayload(value)
  const swapFee =
    swapFeeFromPayload ??
    (swapQuote && toCoin
      ? getSwapFeeFromQuote({
          swapQuote,
          fromCoin,
          toCoinKey: { chain: toCoin.chain, id: toCoin.id },
        })
      : undefined)

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

            <Text weight={500} size={14} color="contrast" cropped>
              {getKeysignSwapProviderName(swapPayload)}
            </Text>
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
          {swapFee && (
            <TxFeeRow label={t('swap_fee')}>
              <Text size={14} color="shy">
                <SwapFeeFiatValue value={[swapFee]} />
              </Text>
            </TxFeeRow>
          )}
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
