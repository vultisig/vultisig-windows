import { borderRadius } from '@lib/ui/css/borderRadius'
import { LineSeparator } from '@lib/ui/layout/LineSeparator'
import { StackSeparatedBy } from '@lib/ui/layout/StackSeparatedBy'
import { getColor } from '@lib/ui/theme/getters'
import { getVaultId, Vault } from '@vultisig/core-mpc/vault/Vault'
import styled from 'styled-components'

import { VaultItem } from './VaultItem'

// Drawn over the rows, as the frame's zero-height lines are, so the pitch stays 58.
const Separator = styled(LineSeparator)`
  margin-top: -1px;
  position: relative;
`

const Container = styled(StackSeparatedBy)`
  background: ${getColor('foreground')};
  ${borderRadius.md};
  overflow: hidden;
  width: 100%;
`

/** The joined vault rows inside a vault selection card. */
export const VaultList = ({ vaults }: { vaults: Vault[] }) => {
  return (
    <Container direction="column" separator={<Separator kind="regular" />}>
      {vaults.map(vault => (
        <VaultItem key={getVaultId(vault)} value={vault} />
      ))}
    </Container>
  )
}
