import { DefiProtocol } from '@core/ui/defi/protocols/core'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { CircleIcon } from '@lib/ui/icons/CircleIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

type DefiProtocolItemProps = {
  protocol: DefiProtocol
}

const protocolIcons: Record<DefiProtocol, React.ComponentType> = {
  circle: CircleIcon,
}

const protocolLabels: Record<DefiProtocol, string> = {
  circle: 'Circle',
}

export const DefiProtocolItem = ({ protocol }: DefiProtocolItemProps) => {
  const navigate = useCoreNavigate()

  const Icon = protocolIcons[protocol]
  const label = protocolLabels[protocol]

  const handleClick = () => {
    navigate({ id: 'defi', state: { protocol } })
  }

  return (
    <StyledPanel onClick={handleClick}>
      <HStack fullWidth alignItems="center" gap={12}>
        <IconWrapper style={{ fontSize: 32 }}>
          <Icon />
        </IconWrapper>

        <VStack fullWidth alignItems="start" gap={4}>
          <Text color="contrast" size={14}>
            {label}
          </Text>
        </VStack>

        <IconWrapper>
          <ChevronRightIcon />
        </IconWrapper>
      </HStack>
    </StyledPanel>
  )
}

const StyledPanel = styled(Panel)`
  cursor: pointer;

  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${getColor('foregroundExtra')};
  }
`
