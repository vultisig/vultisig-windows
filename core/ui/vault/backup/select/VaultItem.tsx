import { hStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import styled from 'styled-components'

import { VaultSigners } from '../../signers'
import { Vault } from '../../Vault'

const Container = styled.div`
  padding: 12px 20px;
  ${hStack({
    justifyContent: 'space-between',
    alignItems: 'center',
    fullWidth: true,
  })}
`

export const VaultItem = ({ value }: ValueProp<Vault>) => (
  <Container>
    <Text weight="500" size={14}>
      {value.name}
    </Text>
    <VaultSigners vault={value} />
  </Container>
)
