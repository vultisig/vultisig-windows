import { hasServer, isServer } from '@core/mpc/devices/localPartyId'
import { getKeygenThreshold } from '@core/mpc/getKeygenThreshold'
import { Vault } from '@core/ui/vault/Vault'
import { ShieldIcon } from '@lib/ui/icons/ShieldIcon'
import { ZapIcon } from '@lib/ui/icons/ZapIcon'
import { getColor } from '@lib/ui/theme/getters'
import { FC, HTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

const StyledText = styled.span`
  color: ${getColor('textExtraLight')};
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
`

const StyledVaultSigners = styled.div`
  align-items: center;
  background-color: ${getColor('backgroundsSecondary')};
  border: solid 1px ${getColor('borderLight')};
  border-radius: 16px;
  display: flex;
  gap: 8px;
  height: 32px;
  padding: 12px 16px;
`

interface VaultSignersProps
  extends Pick<HTMLAttributes<HTMLDivElement>, 'onClick' | 'style'> {
  vault: Vault
}

export const VaultSigners: FC<VaultSignersProps> = ({ vault, ...rest }) => {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const total = vault.signers.length
  const least = getKeygenThreshold(total)
  const fast = hasServer(vault.signers) && !isServer(vault.localPartyId)

  return (
    <StyledVaultSigners {...rest}>
      {fast ? (
        <>
          <ZapIcon fontSize={16} stroke={colors.alertWarning.toHex()} />
          <StyledText>{t('fast')}</StyledText>
        </>
      ) : (
        <>
          <ShieldIcon fontSize={16} stroke={colors.alertSuccess.toHex()} />
          <StyledText>{`${least}-${t('of')}-${total}`}</StyledText>
        </>
      )}
    </StyledVaultSigners>
  )
}
