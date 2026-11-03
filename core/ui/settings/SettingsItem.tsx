import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { StationChevronRightSmallIcon } from '@lib/ui/icons/StationFigmaIcons'
import { HStack } from '@lib/ui/layout/Stack'
import { ListItem } from '@lib/ui/list/item'
import { UiProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { ReactNode, useContext } from 'react'
import styled from 'styled-components'

import { SettingsItemTitleVariantContext } from './settingsItemTitleVariant'

type SettingsItemTone = 'regular' | 'danger'

// 2px at the 16px render size, on the icon's 24 viewBox.
const largeChevronStrokeWidth = 3

const chevronIcons = {
  small: <StationChevronRightSmallIcon />,
  large: <ChevronRightIcon strokeWidth={largeChevronStrokeWidth} />,
}

type SettingsItemProps = {
  icon: ReactNode
  title: ReactNode
  description?: ReactNode
  /** Sits right after the title, e.g. a tier badge. */
  titleAccessory?: ReactNode
  /** The current value, shown before the chevron. */
  value?: ReactNode
  /** Takes the chevron's place, e.g. a switch. */
  control?: ReactNode
  onClick?: () => void
  tone?: SettingsItemTone
  chevron?: keyof typeof chevronIcons
} & UiProps

/** One row of a settings card: icon, title, optional subtitle and a trailing value, control or chevron. */
export const SettingsItem = ({
  icon,
  title,
  description,
  titleAccessory,
  value,
  control,
  onClick,
  tone = 'regular',
  chevron = 'small',
  ...rest
}: SettingsItemProps) => {
  const titleVariant = useContext(SettingsItemTitleVariantContext)
  const isDanger = tone === 'danger'
  const trailing =
    control ??
    (onClick && (
      <IconWrapper size={16} color="textShy">
        {chevronIcons[chevron]}
      </IconWrapper>
    ))

  return (
    <Row
      icon={
        <IconWrapper size={20} color={isDanger ? 'danger' : 'textShyExtra'}>
          {icon}
        </IconWrapper>
      }
      title={
        <HStack alignItems="center" gap={4}>
          <Text
            as="span"
            color={isDanger ? 'danger' : 'regular'}
            variant={titleVariant}
            cropped
          >
            {title}
          </Text>
          {titleAccessory}
        </HStack>
      }
      description={
        description && (
          <Description
            as="span"
            color={isDanger ? 'danger' : 'shyExtra'}
            variant="caption"
            $isDanger={isDanger}
          >
            {description}
          </Description>
        )
      }
      extra={
        (value || trailing) && (
          <HStack alignItems="center" gap={12}>
            {value && (
              <Text as="span" color="regular" variant="subtitle" nowrap>
                {value}
              </Text>
            )}
            {trailing}
          </HStack>
        )
      }
      onClick={onClick}
      hoverable={Boolean(onClick)}
      {...rest}
    />
  )
}

const Row = styled(ListItem)`
  gap: 12px;
  min-height: 0;
  padding: 16px 12px;

  > :nth-child(2) {
    flex-shrink: 0;
  }
`

const Description = styled(Text)<{ $isDanger: boolean }>`
  opacity: ${({ $isDanger }) => ($isDanger ? 0.8 : 1)};
`
