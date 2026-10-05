import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { ReactNode } from 'react'
import styled from 'styled-components'

import { ChainEntityIcon } from '../../../../chain/coin/icon/ChainEntityIcon'
import { CoinIcon } from '../../../../chain/coin/icon/CoinIcon'
import { getChainLogoSrc } from '../../../../chain/metadata/getChainLogoSrc'
import { ReviewCard } from '../../../../mpc/keysign/review/ReviewCard'
import { SwapReviewAmount } from './SwapReviewAmount'
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
  /** Shortens the amount to fit the card; for an estimate, never what is signed. */
  fitAmount?: boolean
}

/** One side of the trade: coin, amount and its fiat estimate, as a card. */
export const SwapReviewSide = ({
  coin,
  amount,
  caption,
  withChainBadge,
  fitAmount,
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
          <SwapReviewAmount coin={coin} amount={amount} fit={fitAmount} />
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
