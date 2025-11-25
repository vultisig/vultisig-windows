import { Chain } from '@core/chain/Chain'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { HStack } from '@lib/ui/layout/Stack'
import styled from 'styled-components'

// Placeholder chains to display as icons in the DeFi portfolio header
const displayChains: Chain[] = [
  'Solana' as Chain,
  'Ethereum' as Chain,
  'THORChain' as Chain,
  'Bitcoin' as Chain,
]

export const DefiPortfolioIcons = () => {
  return (
    <IconsContainer>
      <LeftIcons>
        <IconWrapper position="left" index={0}>
          <ChainEntityIcon
            value={getChainLogoSrc(displayChains[0])}
            style={{ fontSize: 48 }}
          />
        </IconWrapper>
        <IconWrapper position="left" index={1}>
          <ChainEntityIcon
            value={getChainLogoSrc(displayChains[1])}
            style={{ fontSize: 48 }}
          />
        </IconWrapper>
      </LeftIcons>
      <RightIcons>
        <IconWrapper position="right" index={0}>
          <ChainEntityIcon
            value={getChainLogoSrc(displayChains[2])}
            style={{ fontSize: 48 }}
          />
        </IconWrapper>
        <IconWrapper position="right" index={1}>
          <ChainEntityIcon
            value={getChainLogoSrc(displayChains[3])}
            style={{ fontSize: 48 }}
          />
        </IconWrapper>
      </RightIcons>
    </IconsContainer>
  )
}

const IconsContainer = styled.div`
  position: absolute;
  top: 24px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  pointer-events: none;
`

const LeftIcons = styled(HStack)`
  gap: 8px;
  padding-left: 20px;
`

const RightIcons = styled(HStack)`
  gap: 8px;
  padding-right: 20px;
`

const IconWrapper = styled.div<{
  position: 'left' | 'right'
  index: number
}>`
  position: relative;
  ${({ position, index }) =>
    position === 'left'
      ? `
    top: ${index * 40}px;
  `
      : `
    top: ${index * 40}px;
  `}
`
