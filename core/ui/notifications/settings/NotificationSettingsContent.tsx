import { VaultSecurityType } from '@core/ui/vault/VaultSecurityType'
import { LightningIcon } from '@lib/ui/icons/LightningIcon'
import { ShieldIcon } from '@lib/ui/icons/ShieldIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { match } from '@vultisig/lib-utils/match'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type VaultNotificationItem = {
  id: string
  name: string
  type: VaultSecurityType
  enabled: boolean
}

type NotificationSettingsContentProps = {
  isEnabled: boolean
  onToggle: (enabled: boolean) => void
  vaults: VaultNotificationItem[]
  onVaultToggle: (vaultId: string, enabled: boolean) => void
  /** When false, vault rows are omitted (e.g. dedicated Choose vaults screen). */
  showVaultList?: boolean
  isPending?: boolean
}

const VaultTypeIcon = styled.div<{ $isFast: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 99px;
  background: ${getColor('foregroundDark')};
  border: 1px solid ${getColor('foregroundExtra')};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${props => getColor(props.$isFast ? 'idle' : 'primary')(props)};
`

const FastVaultGlyph = styled.span`
  font-size: 16px;
  line-height: 0;
`

const SecureVaultGlyph = styled(ShieldIcon)`
  font-size: 16px;
`

const PushSection = styled.div`
  padding: 8px 0;
`

const DescriptionMaxWidth = styled.div`
  max-width: 233px;
`

const VaultSection = styled.div`
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
`

const VaultListCard = styled.div`
  background: ${getColor('foreground')};
  border-radius: 12px;
  overflow: hidden;
  width: 100%;
`

const VaultRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 12px;

  &:not(:last-child) {
    border-bottom: 1px solid ${getColor('foregroundExtra')};
  }
`

const VaultRowLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
`

const VaultName = styled(Text)`
  flex: 1;
  min-width: 0;
`

const LeftColumn = styled.div`
  flex: 1;
  min-width: 0;
`

export const NotificationSettingsContent = ({
  isEnabled,
  onToggle,
  vaults,
  onVaultToggle,
  showVaultList = true,
  isPending = false,
}: NotificationSettingsContentProps) => {
  const { t } = useTranslation()

  return (
    <VStack fullWidth alignItems="stretch" gap={0}>
      <PushSection>
        <div
          data-testid="push-notifications-row"
          style={{ display: 'contents' }}
        >
          <HStack alignItems="center" gap={4} fullWidth>
            <span
              aria-hidden
              data-enabled={isEnabled ? 'true' : 'false'}
              data-testid="push-notifications-is-enabled"
              style={{ display: 'none' }}
            />
            <LeftColumn>
              <VStack alignItems="start" gap={4}>
                <Text size={16} weight={500} color="regular">
                  {t('push_notifications')}
                </Text>
                <DescriptionMaxWidth>
                  <Text variant="caption" color="shyExtra">
                    {t('push_notifications_description')}
                  </Text>
                </DescriptionMaxWidth>
              </VStack>
            </LeftColumn>
            <Switch
              checked={isEnabled}
              disabled={isPending}
              onChange={onToggle}
            />
          </HStack>
        </div>
      </PushSection>
      {isEnabled && showVaultList && (
        <VaultSection>
          <Text variant="footnote" color="shy">
            {t('vault_notifications')}
          </Text>
          <VaultListCard>
            {vaults.map(vault => (
              <VaultRow key={vault.id}>
                <VaultRowLeft>
                  <VaultTypeIcon $isFast={vault.type === 'fast'}>
                    {match(vault.type, {
                      fast: () => (
                        <FastVaultGlyph>
                          <LightningIcon />
                        </FastVaultGlyph>
                      ),
                      secure: () => <SecureVaultGlyph />,
                    })}
                  </VaultTypeIcon>
                  <VaultName size={14} weight={500} color="regular" cropped>
                    {vault.name}
                  </VaultName>
                </VaultRowLeft>
                <Switch
                  checked={vault.enabled}
                  disabled={isPending}
                  onChange={enabled => {
                    onVaultToggle(vault.id, enabled)
                  }}
                />
              </VaultRow>
            ))}
          </VaultListCard>
        </VaultSection>
      )}
    </VStack>
  )
}
