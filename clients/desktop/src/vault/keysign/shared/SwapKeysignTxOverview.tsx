import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import {
  OneInchSwapPayload,
  OneInchSwapPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/1inch_swap_payload_pb'
import { Coin } from '@core/mpc/types/vultisig/keysign/v1/coin_pb'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { formatAmount } from '@lib/utils/formatAmount'
import { match } from '@lib/utils/match'
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion'
import { useRive } from '@rive-app/react-canvas'
import { BrowserOpenURL } from '@wailsapp/runtime'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCurrentTxHash } from '../../../chain/state/currentTxHash'
import { formatFee } from '../../../chain/tx/fee/utils/formatFee'
import { useCopyTxHash } from '../../../chain/ui/hooks/useCopyTxHash'
import { AnimatedVisibility } from '../../../lib/ui/layout/AnimatedVisibility'
import { HStack, VStack } from '../../../lib/ui/layout/Stack'
import { GradientText } from '../../../lib/ui/text'
import { getColor } from '../../../lib/ui/theme/getters'
import { SwapCoinItem } from './SwapCoinItem'

export const SwapKeysignTxOverview = ({ value }: ValueProp<KeysignPayload>) => {
  const txHash = useCurrentTxHash()
  const { RiveComponent: SuccessAnimation } = useRive({
    src: '/assets/animations/vault-creation-success/vault_created.riv',
    autoplay: true,
  })

  const { t } = useTranslation()

  const copyTxHash = useCopyTxHash()
  const {
    coin: potentialFromCoin,
    toAddress,
    memo,
    toAmount,
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
      <VStack alignItems="center" gap={8}>
        <HStack gap={8}>
          {fromCoin && (
            <SwapCoinItem coin={fromCoin} tokenAmount={formattedFromAmount} />
          )}
          {toCoin && (
            <SwapCoinItem
              coin={toCoin}
              tokenAmount={parseFloat(toAmountDecimal)}
            />
          )}
        </HStack>
      </VStack>
    </Wrapper>
  )
}

const Wrapper = styled(VStack)`
  gap: 24px;
`

const AnimationWrapper = styled.div`
  width: 800px;
  height: 350px;
  position: relative;
`

const SuccessText = styled(GradientText)`
  position: absolute;
  bottom: 80px;
  left: 0;
  right: 0;
`

export const SwapStackItem = styled.div`
  padding: 24px 16px;
  border-radius: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  background-color: ${getColor('foreground')};
`
