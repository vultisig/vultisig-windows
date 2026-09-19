import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { ReactNode } from 'react'
import styled from 'styled-components'

import { ChainEntityIcon } from '../../../../chain/coin/icon/ChainEntityIcon'
import { CoinIcon } from '../../../../chain/coin/icon/CoinIcon'
import { TokenVerificationBadge } from '../../../../chain/coin/verification/TokenVerificationBadge'
import { getChainLogoSrc } from '../../../../chain/metadata/getChainLogoSrc'
import { ReviewCard } from '../../../../mpc/keysign/review/ReviewCard'
import { SwapVerifyFiatAmount } from './SwapVerifyFiatAmount'

const coinIconSize = 36
const chainBadgeSize = 20

const Side = styled(ReviewCard)`
  flex: 1;
`

const IconWithChain = styled.div`
  position: relative;
  ${sameDimensions(coinIconSize)};
`

const ChainBadge = styled.div`
  position: absolute;
  right: -4px;
  bottom: -4px;
  ${sameDimensions(chainBadgeSize)};
  ${centerContent};
  ${borderRadius.pill};
  background: ${getColor('textShyExtra')};
  border: 2px solid ${getColor('foreground')};
  font-size: 12px;
`

type SwapReviewSideProps = {
  coin: Coin
  /** Rendered instead of the amount while it is still resolving. */
  amount: number | ReactNode
  /** The floor the trade guarantees, when it has one. */
  caption?: ReactNode
  withChainBadge?: boolean
}

/** One side of the trade: coin, amount and its fiat estimate, as a card. */
export const SwapReviewSide = ({
  coin,
  amount,
  caption,
  withChainBadge,
}: SwapReviewSideProps) => (
  <Side>
    {withChainBadge ? (
      <IconWithChain>
        <CoinIcon coin={coin} style={{ fontSize: coinIconSize }} />
        <ChainBadge>
          <ChainEntityIcon value={getChainLogoSrc(coin.chain)} />
        </ChainBadge>
      </IconWithChain>
    ) : (
      <CoinIcon coin={coin} style={{ fontSize: coinIconSize }} />
    )}
    <VStack alignItems="center" gap={0} fullWidth>
      {typeof amount === 'number' ? (
        <>
          <HStack alignItems="center" justifyContent="center" gap={4}>
            <Text
              as="span"
              variant="stationBodyS"
              color="regular"
              centerHorizontally
            >
              {formatAmount(amount, coin)}
            </Text>
            <TokenVerificationBadge value={coin} />
          </HStack>
          <SwapVerifyFiatAmount coin={coin} amount={amount} />
        </>
      ) : (
        amount
      )}
    </VStack>
    {caption && (
      <Text as="span" variant="caption" color="shy" centerHorizontally>
        {caption}
      </Text>
    )}
  </Side>
)
