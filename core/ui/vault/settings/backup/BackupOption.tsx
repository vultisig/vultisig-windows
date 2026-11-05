import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { StationChevronRightSmallIcon } from '@lib/ui/icons/StationFigmaIcons'
import { hStack, VStack } from '@lib/ui/layout/Stack'
import { ChildrenProp, OnClickProp, TitleProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled from 'styled-components'


const IconContainer = styled(IconWrapper)`
  color: ${getColor('primaryAccentFour')};
  font-size: 20px;
`

const InteractiveIndicator = styled(IconWrapper)`
  color: ${getColor('textShy')};
  font-size: 16px;
`

const Container = styled(UnstyledButton)`
  ${hStack({
    gap: 12,
    alignItems: 'center',
  })}
  ${borderRadius.xl};
  background: ${getColor('settingsRaisedSurface')};
  border: 1px solid ${getColor('foregroundExtra')};
  padding: 15px;
  text-align: left;

  &:hover ${InteractiveIndicator} {
    color: ${getColor('text')};
  }

  &:focus-visible {
    outline: 2px solid ${getColor('primary')};
    outline-offset: 2px;
  }
`

type InfoItemProps = {
  icon: ReactNode
} & ChildrenProp &
  TitleProp &
  OnClickProp

/** One option of the backup chooser: icon, title, description and a chevron. */
export const BackupOption = ({
  icon,
  children,
  onClick,
  title,
}: InfoItemProps) => {
  return (
    <Container onClick={onClick}>
      <IconContainer>{icon}</IconContainer>
      <VStack flexGrow alignItems="start" gap={4}>
        <SettingsBaselineText color="regular" variant="subtitle">
          {title}
        </SettingsBaselineText>
        <Text color="shyExtra" variant="caption">
          {children}
        </Text>
      </VStack>
      <InteractiveIndicator>
        <StationChevronRightSmallIcon />
      </InteractiveIndicator>
    </Container>
  )
}
