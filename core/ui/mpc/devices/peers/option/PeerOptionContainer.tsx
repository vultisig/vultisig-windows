import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { hStack } from '@lib/ui/layout/Stack'
import { IsActiveProp } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import styled, { css } from 'styled-components'

export const peerOption = css`
  padding: 16px;
  border-radius: 16px;

  border: 1px dashed ${getColor('foregroundSuper')};

  ${hStack({ gap: 8, alignItems: 'center' })}
`

export const peerOptionActive = css`
  background: #042436;
  border: 1px solid ${getColor('primary')};
`

export const PeerOptionContainer = styled(UnstyledButton)<IsActiveProp>`
  padding: 16px;
  border-radius: 16px;

  border: 1px dashed ${getColor('foregroundSuper')};

  ${hStack({ gap: 8, alignItems: 'center' })}

  ${({ isActive }) => isActive && peerOptionActive}
`
