import { getColor } from '@lib/ui/theme/getters'
import { FC, HTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const StyledVaultActive = styled.span`
  align-items: center;
  background-color: ${getColor('backgroundsSecondary')};
  border: solid 1px ${getColor('borderLight')};
  border-radius: 20px;
  color: ${getColor('alertSuccess')};
  display: flex;
  font-size: 13px;
  font-weight: 500;
  height: 34px;
  padding: 0 12px;
`

export const VaultActive: FC<
  Pick<HTMLAttributes<HTMLSpanElement>, 'onClick' | 'style'>
> = ({ ...rest }) => {
  const { t } = useTranslation()

  return <StyledVaultActive {...rest}>{t('active')}</StyledVaultActive>
}
