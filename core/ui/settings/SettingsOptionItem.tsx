import { HSLA } from '@lib/ui/colors/HSLA'
import { CircleCheckFilledIcon } from '@lib/ui/icons/CircleCheckFilledIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { ListItem } from '@lib/ui/list/item'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import { SettingsBaselineText } from './SettingsBaselineText'

// Figma Backgrounds/surface-1-2; no theme token carries it.
const selectedFill = new HSLA(215.3, 66.2, 15.1)

type SettingsOptionItemProps = {
  title: string
  description?: string
  isSelected: boolean
  onClick: () => void
}

/** One choice of a settings single-select list, with a check on the current one. */
export const SettingsOptionItem = ({
  title,
  description,
  isSelected,
  onClick,
}: SettingsOptionItemProps) => (
  <Row
    $isSelected={isSelected}
    description={
      description && (
        <Text as="span" color="shyExtra" variant="caption">
          {description}
        </Text>
      )
    }
    extra={
      isSelected && (
        <IconWrapper size={16} color="buttonPrimary">
          <CircleCheckFilledIcon />
        </IconWrapper>
      )
    }
    onClick={onClick}
    title={
      <SettingsBaselineText
        as="span"
        color="regular"
        variant={description ? 'subtitle' : 'stationBodyS'}
      >
        {title}
      </SettingsBaselineText>
    }
  />
)

const Row = styled(ListItem)<{ $isSelected: boolean }>`
  --icon-accent: ${getColor('text')};
  background-color: ${({ $isSelected, theme }) =>
    $isSelected
      ? selectedFill.toCssValue()
      : theme.colors.foreground.toCssValue()};
  gap: 12px;
  min-height: 65px;
  padding: 14px 20px;
`
