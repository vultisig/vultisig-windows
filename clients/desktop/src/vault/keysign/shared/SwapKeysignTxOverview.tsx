import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import { OneInchSwapPayload } from '@core/mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { Button } from '@lib/ui/buttons/Button'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { centerContent } from '@lib/ui/css/centerContent'
import { round } from '@lib/ui/css/round'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { SquareArrowTopIcon } from '@lib/ui/icons/SquareArrowTopIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { GradientText, Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion'
import { useRive } from '@rive-app/react-canvas'
import { BrowserOpenURL } from '@wailsapp/runtime'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { useCurrentTxHash } from '../../../chain/state/currentTxHash'
import { formatFee } from '../../../chain/tx/fee/utils/formatFee'
import { AnimatedVisibility } from '../../../lib/ui/layout/AnimatedVisibility'
import { SeparatedByLine } from '../../../lib/ui/layout/SeparatedByLine'
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate'
import { useCurrentVault } from '../../state/currentVault'
import { SwapCoinItem } from './SwapCoinItem'

export const SwapKeysignTxOverview = ({ value }: ValueProp<KeysignPayload>) => {
  const txHash = useCurrentTxHash()
  const navigate = useAppNavigate()
  const { RiveComponent: SuccessAnimation } = useRive({
    src: '/assets/animations/vault-creation-success/vault_created.riv',
    autoplay: true,
  })

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

  const trackTransaction = () => BrowserOpenURL(blockExplorerUrl)

  return (
    <Wrapper>
      <AnimationWrapper>
        <SuccessAnimation />
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
          <HStack fullWidth justifyContent="space-between" alignItems="center">
            <Text weight="500" size={14} color="shy">
              {t('transaction')}
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
                {txHash}
              </Text>
              <IconButton
                size="s"
                onClick={trackTransaction}
                icon={<SquareArrowTopIcon />}
              />
            </HStack>
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
                {fromCoin.address}
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
            onClick={trackTransaction}
            style={{
              flex: 1,
            }}
            kind="secondary"
          >
            {t('track')}
          </Button>
          <StyledButton
            onClick={() =>
              navigate('vault', {
                replace: true,
              })
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
  width: 800px;
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
