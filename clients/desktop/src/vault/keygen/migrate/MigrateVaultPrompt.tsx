import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { ArrowUpFromDotIcon } from '@lib/ui/icons/ArrowUpFromDotIcon'
import { hStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate'

const Container = styled(UnstyledButton)`
  ${hStack({
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  })}
  padding: 12px 16px;
  ${borderRadius.m};
  color: ${getColor('primary')};
  border: 1px solid
    ${({ theme }) =>
      theme.colors.primary.getVariant({ a: () => 0.25 }).toCssValue()};
  background: ${({ theme }) =>
    theme.colors.primary.getVariant({ a: () => 0.1 }).toCssValue()};
`

export const MigrateVaultPrompt = () => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()

  return (
    <Container onClick={() => navigate({ id: 'migrateVault' })}>
      <ArrowUpFromDotIcon style={{ fontSize: 24 }} />
      <Text weight="500" size={13}>
        {t('upgrade_your_vault_now')}
      </Text>
    </Container>
  )
}
