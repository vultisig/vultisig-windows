import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { WalletIcon } from '@lib/ui/icons/WalletIcon'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const StationMigrationListItemIcon = () => (
  <ListItemIconWrapper>
    <WalletIcon />
  </ListItemIconWrapper>
)

const ListItemIconWrapper = styled(IconWrapper)`
  font-size: 20px;
  color: ${getColor('primaryAlt')};
`
