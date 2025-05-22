import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { generalSwapProviderName } from '@core/chain/swap/general/GeneralSwapProvider'
import { formatFee } from '@core/chain/tx/fee/format/formatFee'
import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import { OneInchSwapPayload } from '@core/mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { SwapCoinItem } from '@core/ui/mpc/keysign/tx/swap/SwapCoinItem'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Animation } from '@lib/ui/animations/Animation'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { centerContent } from '@lib/ui/css/centerContent'
import { round } from '@lib/ui/css/round'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { SquareArrowOutUpRightIcon } from '@lib/ui/icons/SquareArrowOutUpRightIcon'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { SeparatedByLine } from '@lib/ui/layout/SeparatedByLine'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { GradientText, Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { getLastItem } from '@lib/utils/array/getLastItem'
import { withoutUndefined } from '@lib/utils/array/withoutUndefined'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { match } from '@lib/utils/match'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { useCore } from '../../../../state/core'
import { normalizeTxHash } from '../../utils/normalizeTxHash'

const getSwapProvider = (value: KeysignPayload['swapPayload']) => {
  if (!value?.case) return null

  return match(value.case, {
    thorchainSwapPayload: () => 'ThorChain',
    mayachainSwapPayload: () => 'MayaChain',
    oneinchSwapPayload: () => generalSwapProviderName.oneinch,
  })
}

export const SwapKeysignTxOverview = ({
  value,
  txHashes,
}: ValueProp<KeysignPayload> & {
  txHashes: string[]
}) => {
  const txHashNormalized = normalizeTxHash(getLastItem(txHashes), {
    memo: value.memo,
  })
  const isERC20Approve = Boolean(value.erc20ApprovePayload)
  const [approvalTxHash, txHash] = isERC20Approve
    ? [txHashes[0], txHashNormalized]
    : [undefined, txHashNormalized]
  const navigate = useCoreNavigate()
  const vault = useCurrentVault()
  const { t } = useTranslation()

  const {
    coin: potentialFromCoin,
    memo,
    blockchainSpecific,
    swapPayload,
  } = value

  const {
    fromAmount,
    toAmountDecimal,
    toCoin: potentialToCoin,
  } = swapPayload.value as unknown as OneInchSwapPayload
  const toCoin = potentialToCoin ? fromCommCoin(potentialToCoin) : null

  const isSwapTx =
    (swapPayload && swapPayload.value) ||
    memo?.startsWith('=') ||
    memo?.toLowerCase().startsWith('swap')
  const fromCoin = fromCommCoin(shouldBePresent(potentialFromCoin))

  const formattedFromAmount = useMemo(() => {
    return fromChainAmount(BigInt(fromAmount), fromCoin.decimals)
  }, [fromAmount, fromCoin.decimals])

  const { chain } = shouldBePresent(toCoin)

  const networkFeesFormatted = useMemo(() => {
    if (!blockchainSpecific.value) return null

    return formatFee({
      chain: chain as Chain,
      chainSpecific: blockchainSpecific,
    })
  }, [blockchainSpecific, chain])

  const blockExplorerChain: Chain = useMemo(() => {
    if (isSwapTx && swapPayload && swapPayload.value) {
      return match(swapPayload.case, {
        thorchainSwapPayload: () => Chain.THORChain,
        mayachainSwapPayload: () => Chain.MayaChain,
        oneinchSwapPayload: () => chain as Chain,
      })
    }

    return chain as Chain
  }, [chain, isSwapTx, swapPayload])

  const swapProvider = getSwapProvider(swapPayload)

  const { openUrl } = useCore()

  const trackTransaction = (tx: string) =>
    openUrl(
      getBlockExplorerUrl({
        chain: blockExplorerChain,
        entity: 'tx',
        value: tx,
      })
    )

  return (
    <Wrapper>
      <AnimationWrapper>
        <Animation src="/core/animations/vault-created.riv" />
        <AnimatedVisibility delay={300}>
          <SuccessText centerHorizontally size={24}>
            {t('transaction_successful')}
          </SuccessText>
        </AnimatedVisibility>
      </AnimationWrapper>
      <VStack
        style={{
          width: 350,
          marginInline: 'auto',
        }}
        alignItems="center"
        gap={8}
      >
        <HStack
          style={{
            position: 'relative',
          }}
          gap={8}
        >
          {fromCoin && (
            <SwapCoinItem coin={fromCoin} tokenAmount={formattedFromAmount} />
          )}

          <IconWrapper justifyContent="center" alignItems="center">
            <IconInternalWrapper>
              <ChevronRightIcon />
            </IconInternalWrapper>
          </IconWrapper>
          {toCoin && (
            <SwapCoinItem
              coin={toCoin}
              tokenAmount={parseFloat(toAmountDecimal)}
            />
          )}
        </HStack>
        <SwapInfoWrapper gap={16} fullWidth fullHeight flexGrow>
          {withoutUndefined([txHash, approvalTxHash]).map(hash => (
            <HStack
              key={hash}
              fullWidth
              justifyContent="space-between"
              alignItems="center"
            >
              <Text weight="500" size={14} color="shy">
                {hash === approvalTxHash ? t('approval_tx') : t('transaction')}
              </Text>
              <HStack gap={4} alignItems="center">
                <Text
                  style={{
                    width: 100,
                  }}
                  cropped
                  weight="500"
                  size={14}
                  color="contrast"
                >
                  {hash}
                </Text>
                <IconButton
                  size="s"
                  onClick={() => trackTransaction(hash)}
                  icon={<SquareArrowOutUpRightIcon />}
                />
              </HStack>
            </HStack>
          ))}
          {swapProvider && (
            <HStack
              fullWidth
              justifyContent="space-between"
              alignItems="center"
            >
              <Text weight="500" size={14} color="shy">
                {t('provider')}
              </Text>

              <Text weight={500} size={14} color="contrast" cropped>
                {swapProvider}
              </Text>
            </HStack>
          )}
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
        <HStack gap={8} fullWidth justifyContent="space-between">
          <Button
            onClick={() => trackTransaction(txHash)}
            style={{
              flex: 1,
            }}
            kind="secondary"
          >
            {t('track')}
          </Button>
          <StyledButton
            onClick={() =>
              navigate(
                { id: 'vault' },
                {
                  replace: true,
                }
              )
            }
          >
            {t('done')}
          </StyledButton>
        </HStack>
      </VStack>
    </Wrapper>
  )
}

const StyledButton = styled(Button)`
  background-color: hsl(224, 75%, 50%);
  color: ${getColor('contrast')};
  font-weight: 600;
  flex: 1;

  &:hover {
    background-color: hsla(224, 75%, 50%, 0.9);
  }
`

const Wrapper = styled(VStack)`
  gap: 24px;
`

const AnimationWrapper = styled.div`
  width: 100%;
  height: 250px;
  position: relative;
  margin-inline: auto;
`

const SuccessText = styled(GradientText)`
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
`

const TrimmedText = styled(Text)<{
  width?: number
}>`
  display: inline-block;
  max-width: ${({ width }) => (width ? `${width}px` : null)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const swapBoxStyles = () => css`
  border-radius: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  background-color: ${getColor('foreground')};
`

const SwapInfoWrapper = styled(SeparatedByLine)`
  padding: 24px;
  ${swapBoxStyles()}
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
