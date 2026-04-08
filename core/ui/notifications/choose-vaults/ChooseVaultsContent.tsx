import { VaultSecurityType } from '@core/ui/vault/VaultSecurityType'
import { LightningIcon } from '@lib/ui/icons/LightningIcon'
import { ShieldIcon } from '@lib/ui/icons/ShieldIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { match } from '@vultisig/lib-utils/match'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export type VaultNotificationItem = {
  id: string
  name: string
  type: VaultSecurityType
  enabled: boolean
}

type ChooseVaultsContentProps = {
  vaults: VaultNotificationItem[]
  onVaultToggle: (vaultId: string, enabled: boolean) => void
  onEnableAll: (enabled: boolean) => void
  allEnabled: boolean
  onDone: () => void
}

type BodyProps = Omit<ChooseVaultsContentProps, 'onDone'>

export const ChooseVaultsContent: FC<BodyProps> = ({
  vaults,
  onVaultToggle,
  onEnableAll,
  allEnabled,
}) => {
  const { t } = useTranslation()

  return (
    <VStack fullWidth gap={20} padding="20px 0 0 0">
      <Text color="shy" size={14} weight={400}>
        {t('manage_notifications_in_settings')}
      </Text>
      <VaultListCard fullWidth>
        <Row alignItems="center" fullWidth justifyContent="space-between">
          <Text color="regular" size={14} weight={500}>
            {t('enable_all')}
          </Text>
          <Switch checked={allEnabled} onChange={onEnableAll} />
        </Row>
        <SeparatorLine />
        <VaultRows fullWidth>
          {vaults.map(vault => (
            <VaultRow
              alignItems="center"
              fullWidth
              justifyContent="space-between"
              key={vault.id}
            >
              <VaultTitleArea alignItems="center" gap={12}>
                <VaultTypeIconFrame>
                  <VaultGlyph $isFast={vault.type === 'fast'}>
                    {match(vault.type, {
                      fast: () => <LightningIcon />,
                      secure: () => <ShieldIcon />,
                    })}
                  </VaultGlyph>
                </VaultTypeIconFrame>
                <Text color="regular" cropped size={14} weight={500}>
                  {vault.name}
                </Text>
              </VaultTitleArea>
              <Switch
                checked={vault.enabled}
                onChange={value => onVaultToggle(vault.id, value)}
              />
            </VaultRow>
          ))}
        </VaultRows>
      </VaultListCard>
    </VStack>
  )
}

const VaultListCard = styled(VStack)`
  background-color: ${getColor('foreground')};
  border-radius: 24px;
  overflow: hidden;
`

const Row = styled(HStack)`
  min-height: 58px;
  padding: 12px 16px;
`

const SeparatorLine = styled.div`
  background-color: ${getColor('foregroundExtra')};
  height: 1px;
  width: 100%;
`

const VaultRows = styled(VStack)``

const VaultRow = styled(HStack)`
  min-height: 58px;
  padding: 12px 16px;

  &:not(:first-child) {
    border-top: 1px solid ${getColor('foregroundExtra')};
  }
`

const VaultTitleArea = styled(HStack)`
  flex: 1;
  min-width: 0;
`

const VaultTypeIconFrame = styled.div`
  align-items: center;
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 50%;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding: 12px;
`

const VaultGlyph = styled.span<{ $isFast: boolean }>`
  color: ${props => getColor(props.$isFast ? 'idle' : 'primary')(props)};
  display: flex;
  font-size: 16px;
`
