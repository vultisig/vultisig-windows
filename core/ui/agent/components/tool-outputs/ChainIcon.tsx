import { Chain } from '@core/chain/Chain'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { FC } from 'react'
import styled from 'styled-components'

type ChainIconProps = {
  chain: Chain
  size?: number
}

export const ChainIcon: FC<ChainIconProps> = ({ chain, size = 24 }) => {
  const src = getChainLogoSrc(chain)
  return (
    <Container $size={size}>
      <ChainEntityIcon value={src} />
    </Container>
  )
}

const Container = styled.div<{ $size: number }>`
  font-size: ${({ $size }) => $size}px;
  display: flex;
  align-items: center;
  justify-content: center;
`
