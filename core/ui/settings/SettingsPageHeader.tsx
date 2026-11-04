import { useCore } from '@core/ui/state/core'
import { IconButton, iconButtonSize } from '@lib/ui/buttons/IconButton'
import { ChevronLeftSmallIcon } from '@lib/ui/icons/ChevronLeftSmallIcon'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { ReactNode } from 'react'
import styled from 'styled-components'

const backIconSize = 20

type SettingsPageHeaderProps = {
  title: ReactNode
  onBack?: () => void
  secondaryControls?: ReactNode
}

/** The compact 56px header of the settings list screens. */
export const SettingsPageHeader = ({
  title,
  onBack,
  secondaryControls,
}: SettingsPageHeaderProps) => {
  const { goBack } = useCore()

  return (
    <Header
      hasBorder
      primaryControls={
        <BackButton
          data-testid="page-header-back"
          onClick={onBack ?? goBack}
          size="sm"
        >
          <ChevronLeftSmallIcon />
        </BackButton>
      }
      secondaryControls={secondaryControls}
      title={
        <Title as="span" color="regular" variant="stationBodyS" cropped>
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
`

// Same 1px baseline offset as the rows; Figma also centers the title half a pixel right.
const Title = styled(Text)`
  left: 0.5px;
  max-width: 60%;
  position: relative;
  top: 1px;
`
