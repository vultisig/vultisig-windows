import { Shield } from '@lib/ui/icons/Shield'
import { Zap } from '@lib/ui/icons/Zap'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { getColor } from '@lib/ui/theme/getters'
import { pxToRem } from '@lib/utils/pxToRem'
import { FC, HTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const StyledText = styled.span`
  color: ${getColor('textExtraLight')};
  font-size: ${pxToRem(12)};
  font-weight: 500;
  line-height: ${pxToRem(16)};
`

const StyledListItemExtraDevices = styled.div`
  align-items: center;
  background-color: ${getColor('backgroundsSecondary')};
  border: solid ${pxToRem(1)} ${getColor('borderLight')};
  border-radius: ${pxToRem(16)};
  display: flex;
  gap: ${pxToRem(8)};
  height: ${pxToRem(32)};
  padding: ${pxToRem(12)} ${pxToRem(16)};
`

interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  devices: number
  secure?: boolean
}

export const ListItemExtraDevices: FC<ComponentProps> = ({
  devices,
  secure,
  ...rest
}) => {
  const { t } = useTranslation()
  const least = Math.round(devices / 2) // TODO: replace with correct formula

  return (
    <StyledListItemExtraDevices {...rest}>
      {secure ? (
        <>
          <Shield
            height={16}
            stroke={darkTheme.colors.alertSuccess.toHex()} // TODO: get color from current theme
            width={16}
          />
          <StyledText>{`${least}-${t('of')}-${devices}`}</StyledText>
        </>
      ) : (
        <>
          <Zap
            height={16}
            stroke={`${darkTheme.colors.alertWarning.toHex()}`} // TODO: get color from current theme
            width={16}
          />
          <StyledText>{t('fast')}</StyledText>
        </>
      )}
    </StyledListItemExtraDevices>
  )
}
