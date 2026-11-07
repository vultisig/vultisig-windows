import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { StationChevronRightSmallIcon } from '@lib/ui/icons/StationFigmaIcons'
import { hStack, vStack } from '@lib/ui/layout/Stack'
import { ChildrenProp, OnClickProp, TitleProp } from '@lib/ui/props'
import { text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

const Header = styled.div`
  ${hStack({
    justifyContent: 'space-between',
    alignItems: 'center',
    fullWidth: true,
  })}

  ${text({
    color: 'shy',
    weight: 500,
  })}
  min-height: 24px;
`

const Container = styled(UnstyledButton)`
  padding: 13px;
  ${borderRadius.xl};
  font-size: 14px;
  line-height: 20px;
  border: 1px solid ${getColor('foregroundExtra')};
  ${vStack({
    gap: 12,
  })}

  &:hover ${Header} {
    color: ${getColor('text')};
  }

  &:focus-visible {
    outline: 2px solid ${getColor('primary')};
    outline-offset: 2px;
  }
`

/** A tappable card on the vault selection page: a title and a preview of its vaults. */
export const OptionContainer = ({
  children,
  title,
  onClick,
}: ChildrenProp & OnClickProp & TitleProp) => (
  <Container onClick={onClick}>
    <Header>
      <SettingsBaselineText as="span">{title}</SettingsBaselineText>
      <IconWrapper size={16}>
        <StationChevronRightSmallIcon />
      </IconWrapper>
    </Header>
    {children}
  </Container>
)
