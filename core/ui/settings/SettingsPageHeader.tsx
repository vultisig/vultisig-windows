import { useCore } from '@core/ui/state/core'
import { IconButton, iconButtonSize } from '@lib/ui/buttons/IconButton'
import { ChevronLeftSmallIcon } from '@lib/ui/icons/ChevronLeftSmallIcon'
import { StationChevronLeftIcon } from '@lib/ui/icons/StationFigmaIcons'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { ReactNode } from 'react'
import styled, { useTheme } from 'styled-components'

const backIconSize = 20

type SettingsPageHeaderProps = {
  title: ReactNode
  onBack?: () => void
  secondaryControls?: ReactNode
  hasBorder?: boolean
}

/** The compact 56px header of the settings list screens. */
export const SettingsPageHeader = ({
  title,
  onBack,
  secondaryControls,
  hasBorder = true,
}: SettingsPageHeaderProps) => {
  const { goBack } = useCore()
  const { iconStyle } = useTheme()

  return (
    <Header
      hasBorder={hasBorder}
      primaryControls={
        <BackButton
          data-testid="page-header-back"
          onClick={onBack ?? goBack}
          size="sm"
        >
          {iconStyle === 'station' ? (
            <StationChevronLeftIcon />
          ) : (
            <ChevronLeftSmallIcon />
          )}
        </BackButton>
      }
      secondaryControls={secondaryControls}
      title={
        <Title
          as="span"
          color="regular"
          variant="stationBodyS"
          centerHorizontally
        >
          {title}
        </Title>
      }
    />
  )
}

const Header = styled(PageHeader)`
  min-height: 56px;
  padding-block: 18px 17px;
`

const BackButton = styled(IconButton)`
  margin-left: ${(backIconSize - iconButtonSize.sm) / 2}px;
  position: relative;

  &::after {
    content: '';
    inset: ${(iconButtonSize.sm - iconButtonSize.md) / 2}px;
    position: absolute;
  }
`

// Same 1px baseline offset as the rows; Figma also centers the title half a pixel right.
const Title = styled(Text)`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  left: 0.5px;
  max-width: 60%;
  overflow: hidden;
  overflow-wrap: anywhere;
  position: relative;
  text-wrap: balance;
  top: 1px;
`
