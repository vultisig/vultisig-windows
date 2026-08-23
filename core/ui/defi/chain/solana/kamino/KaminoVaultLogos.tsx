import { getCoinLogoSrc } from '@core/ui/chain/coin/icon/utils/getCoinLogoSrc'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { SafeImage } from '@lib/ui/images/SafeImage'
import { HStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import styled from 'styled-components'

import { KaminoMarkIcon } from './KaminoMarkIcon'

type KaminoVaultLogosProps = {
  /** The vault's underlying coin, whose logo sits in front of the protocol's. */
  coin: Coin
}

/**
 * A vault's identity as a pair of overlapping logos: the protocol behind, the
 * underlying token in front.
 *
 * The back mark is Kamino's rather than the vault's curator's — the curators
 * are carried by the registry as names only, and the app ships no brand art
 * for them.
 */
export const KaminoVaultLogos = ({ coin }: KaminoVaultLogosProps) => (
  <HStack alignItems="center">
    <ProtocolMark />
    <SafeImage
      src={coin.logo ? getCoinLogoSrc(coin.logo) : undefined}
      render={props => <TokenLogo {...props} />}
    />
  </HStack>
)

const logoSize = 32

const ProtocolMark = styled(KaminoMarkIcon)`
  font-size: ${logoSize}px;
  flex-shrink: 0;
`

// The ring is what keeps the two circles readable as two: without it the token
// logo's edge dissolves into whichever part of the mark it happens to cover.
const TokenLogo = styled.img`
  width: ${logoSize}px;
  height: ${logoSize}px;
  ${borderRadius.pill};
  flex-shrink: 0;
  margin-left: -10px;
  border: 2px solid ${getColor('background')};
`
