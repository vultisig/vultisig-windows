import { Shield } from '@lib/ui/icons/Shield'
import { Zap } from '@lib/ui/icons/Zap'
import { pxToRem } from '@lib/utils/pxToRem'
import { FC, HTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

const StyledText = styled.span`
  color: ${({ theme }) => theme.colors.textExtraLight.toHex()};
  font-size: ${pxToRem(12)};
  font-weight: 500;
  line-height: ${pxToRem(16)};
`

const StyledListItemExtraDevices = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.backgroundsSecondary.toHex()};
  border: solid ${pxToRem(1)} ${({ theme }) => theme.colors.borderLight.toHex()};
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
  const { colors } = useTheme()
  const least = Math.round(devices / 2) // TODO: replace with correct formula

  return (
    <StyledListItemExtraDevices {...rest}>
      {secure ? (
        <>
          <Shield height={16} stroke={colors.alertSuccess.toHex()} width={16} />
          <StyledText>{`${least}-${t('of')}-${devices}`}</StyledText>
        </>
      ) : (
        <>
          <Zap height={16} stroke={colors.alertWarning.toHex()} width={16} />
          <StyledText>{t('fast')}</StyledText>
        </>
      )}
    </StyledListItemExtraDevices>
  )
}
