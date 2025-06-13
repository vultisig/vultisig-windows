import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { formatFee } from '@core/chain/tx/fee/format/formatFee'
import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { getKeysignSwapPayload } from '@core/mpc/keysign/swap/getKeysignSwapPayload'
import { getKeysignSwapProviderName } from '@core/mpc/keysign/swap/getKeysignSwapProviderName'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { SwapCoinItem } from '@core/ui/mpc/keysign/tx/swap/SwapCoinItem'
import { normalizeTxHash } from '@core/ui/mpc/keysign/utils/normalizeTxHash'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCore } from '@core/ui/state/core'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Animation } from '@lib/ui/animations/Animation'
import { Button } from '@lib/ui/buttons/Button'
import { centerContent } from '@lib/ui/css/centerContent'
import { round } from '@lib/ui/css/round'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { SeparatedByLine } from '@lib/ui/layout/SeparatedByLine'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { GradientText, Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { getLastItem } from '@lib/utils/array/getLastItem'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { TrackTxPrompt } from './TrackTxPrompt'

export const SwapKeysignTxOverview = ({
  value,
  txHashes,
}: ValueProp<KeysignPayload> & {
  txHashes: string[]
}) => {
  const { t } = useTranslation()
  const { openUrl } = useCore()
  const navigate = useCoreNavigate()
  const vault = useCurrentVault()
  const txHashNormalized = normalizeTxHash(getLastItem(txHashes), {
    memo: value.memo,
    chain: value.coin?.chain as Chain,
  })
  const { coin: potentialFromCoin, blockchainSpecific } = value
  const swapPayload = shouldBePresent(getKeysignSwapPayload(value))
  const {
    fromAmount,
    toAmountDecimal,
    toCoin: potentialToCoin,
  } = getRecordUnionValue(swapPayload)
  const fromCoin = fromCommCoin(shouldBePresent(potentialFromCoin))
  const toCoin = potentialToCoin ? fromCommCoin(potentialToCoin) : null
  const { chain } = shouldBePresent(toCoin)

  const formattedFromAmount = useMemo(() => {
    return fromChainAmount(BigInt(fromAmount), fromCoin.decimals)
  }, [fromAmount, fromCoin.decimals])

  const networkFeesFormatted = useMemo(() => {
    if (!blockchainSpecific.value) return null

    return formatFee({
      chain: chain as Chain,
      chainSpecific: blockchainSpecific,
    })
  }, [blockchainSpecific, chain])

  const trackTransaction = (tx: string) =>
    openUrl(
      getBlockExplorerUrl({
        chain,
        entity: 'tx',
        value: tx,
      })
    )

  return (
    <>
      <VStack style={{ height: 250, position: 'relative' }}>
        <Animation src="/core/animations/vault-created.riv" />
        <AnimatedVisibility delay={300}>
          <GradientText
            as="span"
            size={24}
            style={{ bottom: 40, left: 0, position: 'absolute', right: 0 }}
            centerHorizontally
          >
            {t('transaction_successful')}
          </GradientText>
        </AnimatedVisibility>
      </VStack>
      <VStack alignItems="center" gap={8}>
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
        <SwapInfoWrapper gap={16} fullWidth>
          <TrackTxPrompt
            title={t('transaction')}
            value={txHashNormalized}
            chain={chain}
          />
          {'erc20Approve' in value && (
            <TrackTxPrompt
              title={t('approval_tx')}
              value={txHashes[0]}
              chain={chain}
            />
          )}
          <HStack fullWidth justifyContent="space-between" alignItems="center">
            <Text weight="500" size={14} color="shy">
              {t('provider')}
            </Text>

            <Text weight={500} size={14} color="contrast" cropped>
              {getKeysignSwapProviderName({
                swapPayload,
                chain: getKeysignChain(value),
              })}
            </Text>
          </HStack>
          <HStack fullWidth justifyContent="space-between" alignItems="center">
            <Text weight="500" size={14} color="shy">
              {t('from')}
            </Text>

            <Text
              style={{
                width: 170,
              }}
              weight={500}
              size={14}
              color="contrast"
              cropped
            >
              {vault.name}{' '}
              <Text cropped as="span" color="shy">
                ({fromCoin.address})
              </Text>
            </Text>
          </HStack>
          {toCoin && (
            <HStack
              fullWidth
              justifyContent="space-between"
              alignItems="center"
            >
              <Text weight="500" size={14} color="shy">
                {t('to')}
              </Text>

              <TrimmedText
                cropped
                width={170}
                weight={500}
                size={14}
                color="contrast"
              >
                {toCoin.address}
              </TrimmedText>
            </HStack>
          )}
          {toCoin && (
            <HStack
              fullWidth
              justifyContent="space-between"
              alignItems="center"
            >
              <Text weight="500" size={14} color="shy">
                {t('network_fee')}
              </Text>

              <Text cropped weight={500} size={14} color="contrast">
                {networkFeesFormatted}
              </Text>
            </HStack>
          )}
        </SwapInfoWrapper>
        <HStack gap={8} fullWidth>
          <Button
            kind="secondary"
            onClick={() => trackTransaction(txHashNormalized)}
          >
            {t('track')}
          </Button>
          <Button onClick={() => navigate({ id: 'vault' }, { replace: true })}>
            {t('done')}
          </Button>
        </HStack>
      </VStack>
    </>
  )
}

const TrimmedText = styled(Text)<{
  width?: number
}>`
  display: inline-block;
  max-width: ${({ width }) => (width ? `${width}px` : null)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
