import { borderRadius } from '@lib/ui/css/borderRadius'
import { BoltFilledIcon } from '@lib/ui/icons/BoltFilledIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { ShieldFilledIcon } from '@lib/ui/icons/ShieldFilledIcon'
import { hStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { hasServer, isServer } from '@vultisig/core-mpc/devices/localPartyId'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const ShareBadge = styled.div`
  ${hStack({ alignItems: 'center', gap: 4 })};
  ${borderRadius.pill};
  background: ${getColor('foreground')};
  border: 1.5px solid ${getColor('foregroundExtra')};
  flex-shrink: 0;
  min-height: 32px;
  padding: 6.5px 10.5px;
`

/** Pill with which share of a vault this device holds and whether the vault is fast or secure. */
export const VaultShareBadge = ({ value }: ValueProp<Vault>) => {
  const { t } = useTranslation()
  const { signers, localPartyId } = value
  const isFast = hasServer(signers) && !isServer(localPartyId)

  return (
    <ShareBadge>
      <IconWrapper
        aria-label={t(isFast ? 'fast' : 'secure')}
        color={isFast ? 'idle' : 'success'}
        role="img"
        size={16}
      >
        {isFast ? <BoltFilledIcon /> : <ShieldFilledIcon />}
      </IconWrapper>
      <Text color="shy" nowrap variant="caption">
        {t('vault_share_position', {
          index: signers.indexOf(localPartyId) + 1,
          total: signers.length,
        })}
      </Text>
    </ShareBadge>
  )
}
