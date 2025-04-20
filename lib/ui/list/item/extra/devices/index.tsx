import { Shield } from '@lib/ui/icons/Shield'
import { Zap } from '@lib/ui/icons/Zap'
import { getColor } from '@lib/ui/theme/getters'
import { rem } from '@lib/utils/pxToRem'
import { FC, HTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const StyledShield = styled(Shield)`
  height: ${rem(16)};
  stroke: ${getColor('alertSuccess')};
  width: ${rem(16)};
`

const StyledText = styled.span`
  color: ${getColor('textExtraLight')};
  font-size: ${rem(12)};
  font-weight: 500;
  line-height: ${rem(16)};
`

const StyledZap = styled(Zap)`
  height: ${rem(16)};
  stroke: ${getColor('alertWarning')};
  width: ${rem(16)};
`

const StyledListItemExtraDevices = styled.div`
  align-items: center;
  background-color: ${getColor('backgroundsSecondary')};
  border: solid ${rem(1)} ${getColor('borderLight')};
  border-radius: ${rem(16)};
  display: flex;
  gap: ${rem(8)};
  height: ${rem(32)};
  padding: ${rem(12)} ${rem(16)};
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
  const least = Math.round(devices / 2)

  return (
    <StyledListItemExtraDevices {...rest}>
      {secure ? (
        <>
          <StyledShield />
          <StyledText>{`${least}-${t('of')}-${devices}`}</StyledText>
        </>
      ) : (
        <>
          <StyledZap />
          <StyledText>{t('fast')}</StyledText>
        </>
      )}
    </StyledListItemExtraDevices>
  )
}
