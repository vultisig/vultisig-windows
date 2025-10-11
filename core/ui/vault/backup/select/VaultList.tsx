import { borderRadius } from '@lib/ui/css/borderRadius'
import { LineSeparator } from '@lib/ui/layout/LineSeparator'
import { StackSeparatedBy } from '@lib/ui/layout/StackSeparatedBy'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import { getVaultId, Vault } from '../../Vault'
import { VaultItem } from './VaultItem'

const Container = styled(StackSeparatedBy)`
  background: ${getColor('foregroundExtra')};
  ${borderRadius.m};
  overflow: hidden;
  width: 100%;
`

export const VaultList = ({ vaults }: { vaults: Vault[] }) => {
  return (
    <Container direction="column" separator={<LineSeparator />}>
      {vaults.map(vault => (
        <VaultItem key={getVaultId(vault)} value={vault} />
      ))}
    </Container>
  )
}
