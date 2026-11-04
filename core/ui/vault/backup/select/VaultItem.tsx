import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
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

const ShareBadge = styled.div`
  ${hStack({ alignItems: 'center', gap: 4 })};
  ${borderRadius.pill};
  background: ${getColor('foreground')};
  border: 1.5px solid ${getColor('foregroundExtra')};
  flex-shrink: 0;
  min-height: 32px;
  padding: 6.5px 10.5px;
`

// Wraps, so two long names can't crop to the same text on this choice.
const Name = styled(SettingsBaselineText)`
  min-width: 0;
  overflow-wrap: anywhere;
`

/** A vault's name and which share of it this device holds. */
export const VaultItem = ({ value }: ValueProp<Vault>) => {
  const { t } = useTranslation()
  const { name, signers, localPartyId } = value
  const isFast = hasServer(signers) && !isServer(localPartyId)

  return (
    <Container>
      <Name color="regular" height={20 / 14} size={14} weight={500}>
        {name}
      </Name>
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
    </Container>
  )
}
