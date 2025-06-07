import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import { getVaultColorFromAddress } from './utils/getVaultColorFromAddress'

type VaultAvatarProps = {
  name: string
  address: string
}

export const AddressBookItemAvatar = ({ name, address }: VaultAvatarProps) => {
  const firstLetter = name.charAt(0).toUpperCase()
  const bgColor = getVaultColorFromAddress(address)

  return <Circle style={{ backgroundColor: bgColor }}>{firstLetter}</Circle>
}

const Circle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: ${getColor('text')};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
`
