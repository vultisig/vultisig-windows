import { getColor } from '@lib/ui/theme/getters'
import { rem } from '@lib/utils/pxToRem'
import { FC, HTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const StyledListItemExtraActive = styled.span`
  align-items: center;
  background-color: ${getColor('backgroundsSecondary')};
  border: solid ${rem(1)} ${getColor('borderLight')};
  border-radius: ${rem(20)};
  color: ${getColor('alertSuccess')};
  display: flex;
  font-size: ${rem(13)};
  font-weight: 500;
  height: ${rem(34)};
  padding: 0 ${rem(12)};
`

export const ListItemExtraActive: FC<HTMLAttributes<HTMLDivElement>> = ({
  ...rest
}) => {
  const { t } = useTranslation()

  return (
    <StyledListItemExtraActive {...rest}>
      {t('active')}
    </StyledListItemExtraActive>
  )
}
