import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { hStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import styled from 'styled-components'

import { VaultShareBadge } from './VaultShareBadge'

const Container = styled.div`
  gap: 12px;
  min-height: 58px;
  padding: 12px 20px;
  ${hStack({
    justifyContent: 'space-between',
    alignItems: 'center',
    fullWidth: true,
  })}
`

// Wraps, so two long names can't crop to the same text on this choice.
const Name = styled(SettingsBaselineText)`
  min-width: 0;
  overflow-wrap: anywhere;
  text-align: left;
`

/** A vault's name and which share of it this device holds. */
export const VaultItem = ({ value }: ValueProp<Vault>) => {
  const { name } = value

  return (
    <Container>
      <Name color="regular" height={20 / 14} size={14} weight={500}>
        {name}
      </Name>
      <VaultShareBadge value={value} />
    </Container>
  )
}
