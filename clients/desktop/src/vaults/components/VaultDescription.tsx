import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { cropText } from '@lib/ui/css/cropText'
import { hStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import styled from 'styled-components'

import { VaultSigningInfo } from './VaultSingingInfo'

const Container = styled.div`
  ${hStack({
    flexGrow: true,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  })}
  ${cropText};
`

export const VaultDescription = () => {
  const { name } = useCurrentVault()

  return (
    <Container>
      <Text weight="700" size={16} family="mono" color="contrast" cropped>
        {name}
      </Text>
      <VaultSigningInfo />
    </Container>
  )
}
