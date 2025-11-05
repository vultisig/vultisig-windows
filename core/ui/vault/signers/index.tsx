import { hasServer, isServer } from '@core/mpc/devices/localPartyId'
import { getKeygenThreshold } from '@core/mpc/getKeygenThreshold'
import { Vault } from '@core/mpc/vault/Vault'
import { ShieldIcon } from '@lib/ui/icons/ShieldIcon'
import { ZapIcon } from '@lib/ui/icons/ZapIcon'
import { getColor } from '@lib/ui/theme/getters'
import { FC, HTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const StyledSuccessIcon = styled(ShieldIcon)`
  color: ${getColor('success')};
`

const StyledWarningIcon = styled(ZapIcon)`
  color: ${getColor('idle')};
`

const StyledText = styled.span`
  color: ${getColor('textShy')};
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
`

const StyledVaultSigners = styled.div`
  align-items: center;
  border-radius: 20px;
  background: ${({ theme }) =>
    theme.colors.foreground.withAlpha(0.35).toCssValue()};
  border: 1px solid ${getColor('foregroundExtra')};
  display: flex;
  gap: 6px;
  min-height: 30px;
  padding: 6px 12px;
`

type VaultSignersProps = {
  vault: Vault
} & Pick<HTMLAttributes<HTMLDivElement>, 'onClick' | 'style'>

export const VaultSigners: FC<VaultSignersProps> = ({ vault, ...rest }) => {
  const { t } = useTranslation()
  const total = vault.signers.length
  const least = getKeygenThreshold(total)
  const fast = hasServer(vault.signers) && !isServer(vault.localPartyId)

  return (
    <StyledVaultSigners {...rest}>
      {fast ? (
        <>
          <StyledWarningIcon fontSize={16} />
          <StyledText>{t('fast')}</StyledText>
        </>
      ) : (
        <>
          <StyledSuccessIcon fontSize={16} />
          <StyledText>{`${least}-${t('of')}-${total}`}</StyledText>
        </>
      )}
    </StyledVaultSigners>
  )
}
