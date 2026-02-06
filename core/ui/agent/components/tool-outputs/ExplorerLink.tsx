import { Chain } from '@core/chain/Chain'
import { getBlockExplorerUrl } from '@core/chain/utils/getBlockExplorerUrl'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { SquareArrowTopRightIcon } from '@lib/ui/icons/SquareArrowTopRightIcon'
import { hStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import styled from 'styled-components'

type ExplorerLinkProps = {
  chain: Chain
  entity: 'address' | 'tx'
  value: string
}

export const ExplorerLink: FC<ExplorerLinkProps> = ({
  chain,
  entity,
  value,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const url = getBlockExplorerUrl({ chain, entity, value })
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <StyledExplorerLink onClick={handleClick}>
      <SquareArrowTopRightIcon />
    </StyledExplorerLink>
  )
}

const StyledExplorerLink = styled(UnstyledButton)`
  ${hStack({
    alignItems: 'center',
    justifyContent: 'center',
  })};

  font-size: 14px;
  color: ${getColor('textShy')};
  padding: 4px;
  min-width: 24px;
  min-height: 24px;
  cursor: pointer;
  transition: color 0.2s ease;
  border-radius: 4px;

  &:hover {
    color: ${getColor('textSupporting')};
    background: ${getColor('mist')};
  }

  &:active {
    color: ${getColor('contrast')};
  }
`
