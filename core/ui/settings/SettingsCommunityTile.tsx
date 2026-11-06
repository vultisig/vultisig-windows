import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled from 'styled-components'

const tileHeight = 70

type SettingsCommunityTileProps = {
  icon: ReactNode
  label: ReactNode
  onClick: () => void
}

/** One of the equal-width community link tiles: icon over a caption. */
export const SettingsCommunityTile = ({
  icon,
  label,
  onClick,
}: SettingsCommunityTileProps) => (
  <Container onClick={onClick}>
    <IconWrapper size={20} color="textShyExtra">
      {icon}
    </IconWrapper>
    <Text as="span" color="regular" variant="caption" centerHorizontally>
      {label}
    </Text>
  </Container>
)

const Container = styled(UnstyledButton)`
  align-items: center;
  background-color: ${getColor('foreground')};
  ${borderRadius.lg}
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  height: ${tileHeight}px;
  justify-content: center;
  min-width: 0;
  padding: 12px 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${getColor('foregroundExtra')};
  }
`
