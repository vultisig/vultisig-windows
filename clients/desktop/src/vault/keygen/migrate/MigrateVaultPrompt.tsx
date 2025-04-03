import { borderRadius } from '@lib/ui/css/borderRadius'
import { UpgradeIcon } from '@lib/ui/icons/UpgradeIcon'
import { hStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { makeAppPath } from '../../../navigation'

const Container = styled(Link)`
  ${hStack({
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  })}
  padding: 12px 16px;
  ${borderRadius.m};
  color: ${getColor('success')};
  border: 1px solid
    ${({ theme }) =>
      theme.colors.success.getVariant({ a: () => 0.25 }).toCssValue()};
  background: ${({ theme }) =>
    theme.colors.success.getVariant({ a: () => 0.1 }).toCssValue()};
`

export const MigrateVaultPrompt = () => {
  const { t } = useTranslation()

  return (
    <Container to={makeAppPath('migrateVault')}>
      <UpgradeIcon style={{ fontSize: 24 }} />
      <Text weight="500" size={13}>
        {t('upgrade_your_vault_now')}
      </Text>
    </Container>
  )
}
