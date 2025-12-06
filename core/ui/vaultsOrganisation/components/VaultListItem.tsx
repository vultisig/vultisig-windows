import { Vault } from '@core/mpc/vault/Vault'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'

import { getVaultSecurityTone } from '../utils/getVaultSecurityTone'
import { LeadingIconBadge, VaultListRow } from './VaultListRow'
import { VaultSignersPill } from './VaultSignersPill'

type VaultListItemProps = {
  vault: Vault
  onSelect: () => void
  selected?: boolean
  balance?: number
}

export const VaultListItem = ({
  vault,
  onSelect,
  selected,
  balance,
}: VaultListItemProps) => {
  const { tone, icon } = getVaultSecurityTone(vault)
  const formatFiatAmount = useFormatFiatAmount()

  return (
    <VaultListRow
      leading={<LeadingIconBadge tone={tone}>{icon}</LeadingIconBadge>}
      title={vault.name}
      subtitle={balance !== undefined ? formatFiatAmount(balance) : undefined}
      meta={<VaultSignersPill vault={vault} />}
      selected={selected}
      trailing={
        selected ? (
          <IconWrapper size={20} color="success">
            <CheckIcon />
          </IconWrapper>
        ) : null
      }
      onClick={onSelect}
    />
  )
}
