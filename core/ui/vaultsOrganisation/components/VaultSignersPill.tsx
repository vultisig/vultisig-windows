import { hasServer, isServer } from '@core/mpc/devices/localPartyId'
import { getKeygenThreshold } from '@core/mpc/getKeygenThreshold'
import { Vault } from '@core/mpc/vault/Vault'
import { Text } from '@lib/ui/text'
import { FC, HTMLAttributes } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const PillContainer = styled.div`
  display: flex;
  padding: 3px 8px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 8px;
  border: 1px solid #11284a;
  background: #061b3a;
`

type VaultSignersPillProps = {
  vault: Vault
} & Pick<HTMLAttributes<HTMLDivElement>, 'onClick' | 'style'>

export const VaultSignersPill: FC<VaultSignersPillProps> = ({
  vault,
  ...rest
}) => {
  const { t } = useTranslation()
  const total = vault.signers.length
  const least = getKeygenThreshold(total)
  const fast = hasServer(vault.signers) && !isServer(vault.localPartyId)

  const text = fast ? t('fast') : `${least}-${t('of')}-${total}`

  return (
    <PillContainer {...rest}>
      <Text color="shy" size={12}>
        {text}
      </Text>
    </PillContainer>
  )
}
