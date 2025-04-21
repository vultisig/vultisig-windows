import { getColor } from '@lib/ui/theme/getters'
import { pxToRem } from '@lib/utils/pxToRem'
import { FC, HTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const StyledListItemExtraActive = styled.span`
  align-items: center;
  background-color: ${getColor('backgroundsSecondary')};
  border: solid ${pxToRem(1)} ${getColor('borderLight')};
  border-radius: ${pxToRem(20)};
  color: ${getColor('alertSuccess')};
  display: flex;
  font-size: ${pxToRem(13)};
  font-weight: 500;
  height: ${pxToRem(34)};
  padding: 0 ${pxToRem(12)};
`

export const ListItemExtraActive: FC<HTMLAttributes<HTMLSpanElement>> = ({
  ...rest
}) => {
  const { t } = useTranslation()

  return (
    <StyledListItemExtraActive {...rest}>
      {t('active')}
    </StyledListItemExtraActive>
  )
}
