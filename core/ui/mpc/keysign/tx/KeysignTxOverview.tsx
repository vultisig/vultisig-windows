import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { nativeSwapChains } from '@core/chain/swap/native/NativeSwapChain'
import { formatFee } from '@core/chain/tx/fee/format/formatFee'
import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useCopyTxHash } from '@core/ui/chain/hooks/useCopyTxHash'
import { SwapTrackingLink } from '@core/ui/chain/swap/SwapTrackingLink'
import { TxOverviewAmount } from '@core/ui/chain/tx/TxOverviewAmount'
import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import { TxOverviewRow } from '@core/ui/chain/tx/TxOverviewRow'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { CopyIcon } from '@lib/ui/icons/CopyIcon'
import { LinkIcon } from '@lib/ui/icons/LinkIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { formatAmount } from '@lib/utils/formatAmount'
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useCore } from '../../../state/core'
import { useFiatCurrency } from '../../../storage/fiatCurrency'

export const KeysignTxOverview = ({
  value,
  txHash,
}: ValueProp<KeysignPayload> & {
  txHash: string
}) => {
  const { t } = useTranslation()
  const copyTxHash = useCopyTxHash()
  const fiatCurrency = useFiatCurrency()
  const {
    coin: potentialCoin,
    toAddress,
    memo,
    toAmount,
    blockchainSpecific,
    swapPayload,
  } = value

  const { openUrl } = useCore()

  const isSwapTx =
    (swapPayload && swapPayload.value) ||
    memo?.startsWith('=') ||
    memo?.toLowerCase().startsWith('swap')
  const coin = fromCommCoin(shouldBePresent(potentialCoin))
  const { decimals } = coin

  const coinPriceQuery = useCoinPriceQuery({
    coin,
  })

  const formattedToAmount = useMemo(() => {
    if (!toAmount) return null

    return fromChainAmount(BigInt(toAmount), decimals)
  }, [toAmount, decimals])

  const { chain } = shouldBePresent(coin)

  const networkFeesFormatted = useMemo(() => {
    if (!blockchainSpecific.value) return null

    return formatFee({
      chain: chain as Chain,
      chainSpecific: blockchainSpecific,
    })
  }, [blockchainSpecific, chain])

  const blockExplorerChain: Chain = useMemo(() => {
    if (isSwapTx && swapPayload && swapPayload.value) {
      return matchDiscriminatedUnion(swapPayload, 'case', 'value', {
        thorchainSwapPayload: () => Chain.THORChain,
        mayachainSwapPayload: () => Chain.MayaChain,
        oneinchSwapPayload: () => chain as Chain,
      })
    }

    return chain as Chain
  }, [chain, isSwapTx, swapPayload])

  const blockExplorerUrl = getBlockExplorerUrl({
    chain: blockExplorerChain,
    entity: 'tx',
    value: txHash,
  })

  return (
    <>
      <VStack gap={16}>
        <HStack alignItems="center" gap={4}>
          <Text weight="600" size={20} color="contrast">
            {t('transaction')}
          </Text>
          <IconButton icon={<CopyIcon />} onClick={() => copyTxHash(txHash)} />
          <IconButton
            onClick={() => {
              openUrl(blockExplorerUrl)
            }}
            icon={<LinkIcon />}
          />
        </HStack>
        <Text family="mono" color="primary" size={14} weight="400">
          {txHash}
        </Text>
      </VStack>
      {toAddress && (
        <TxOverviewRow>
          <span>{t('to')}</span>
          <span>{toAddress}</span>
        </TxOverviewRow>
      )}
      <TxOverviewAmount
        value={fromChainAmount(BigInt(toAmount), decimals)}
        ticker={coin.ticker}
      />
      {memo && <TxOverviewMemo value={memo} />}
      {formattedToAmount && (
        <>
          <MatchQuery
            value={coinPriceQuery}
            success={price => (
              <TxOverviewRow>
                <span>{t('value')}</span>
                <span>
                  {formatAmount(formattedToAmount * price, fiatCurrency)}
                </span>
              </TxOverviewRow>
            )}
            error={() => null}
            pending={() => null}
          />
        </>
      )}
      {networkFeesFormatted && (
        <TxOverviewRow>
          <span>{t('network_fee')}</span>
          <span>{networkFeesFormatted}</span>
        </TxOverviewRow>
      )}
      {isSwapTx && isOneOf(blockExplorerChain, nativeSwapChains) && (
        <SwapTrackingLink value={blockExplorerUrl} />
      )}
    </>
  )
}
