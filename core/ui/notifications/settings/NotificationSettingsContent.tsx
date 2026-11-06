import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { SettingsBorderedCard } from '@core/ui/settings/SettingsCard'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { LightningIcon } from '@lib/ui/icons/LightningIcon'
import { ShieldIcon } from '@lib/ui/icons/ShieldIcon'
import { Switch } from '@lib/ui/inputs/switch'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { match } from '@vultisig/lib-utils/match'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { VaultSecurityType } from '../../vault/VaultSecurityType'

type VaultNotificationItem = {
  id: string
  name: string
  type: VaultSecurityType
  enabled: boolean
}

type OnVaultToggleInput = {
  vaultId: string
  enabled: boolean
}

type NotificationSettingsContentProps = {
  isEnabled: boolean
  onToggle: (enabled: boolean) => void
  vaults: VaultNotificationItem[]
  onVaultToggle: (input: OnVaultToggleInput) => void
  /** When false, vault rows are omitted (e.g. dedicated Choose vaults screen). */
  showVaultList?: boolean
  isPending?: boolean
}

// 30, not the former 40, keeps the rows at the frame's 62 with the icon the frame omits.
const VaultTypeIcon = styled.div<{ $isFast: boolean }>`
  width: 30px;
  height: 30px;
  ${borderRadius.pill};
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
  max-width: 231px;
`

const VaultSection = styled.div`
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
`

// This frame draws the card's stroke inside the rows' padding, unlike its siblings.
const VaultListCard = styled(SettingsBorderedCard)`
  border: none;
  outline: 1px solid ${getColor('foregroundExtra')};
  outline-offset: -1px;
`

const VaultRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  padding: 16px 14px;
`

const VaultRowLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
`

const VaultName = styled(SettingsBaselineText)`
  flex: 1;
  min-width: 0;
`

const LeftColumn = styled.div`
  flex: 1;
  min-width: 0;
`

/**
 * Push notification settings block: master toggle plus optional per-vault rows.
 *
 * @param props.isEnabled — Whether any vault is registered for push (master row).
 * @param props.onToggle — Enables or disables push for all vaults shown.
 * @param props.vaults — Rows for per-vault toggles when the list is visible.
 * @param props.onVaultToggle — Called when a vault row switch changes.
 * @param props.showVaultList — When false, per-vault rows are hidden.
 * @param props.isPending — Disables switches while mutations run.
 * @returns The settings layout.
 */
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
                <SettingsBaselineText
                  height={1.5}
                  size={16}
                  weight={500}
                  color="regular"
                >
                  {t('push_notifications')}
                </SettingsBaselineText>
                <DescriptionMaxWidth>
                  <Text variant="caption" color="shyExtra">
                    {t('push_notifications_description')}
                  </Text>
                </DescriptionMaxWidth>
              </VStack>
            </LeftColumn>
            <Switch
              checked={isEnabled}
              loading={isPending}
              onChange={onToggle}
              size="large"
            />
          </HStack>
        </div>
      </PushSection>
      {isEnabled && showVaultList && (
        <VaultSection>
          <SettingsBaselineText variant="footnote" color="shy">
            {t('vault_notifications')}
          </SettingsBaselineText>
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
                  <VaultName color="regular" variant="stationBodyS" cropped>
                    {vault.name}
                  </VaultName>
                </VaultRowLeft>
                <Switch
                  checked={vault.enabled}
                  loading={isPending}
                  onChange={enabled => {
                    onVaultToggle({ vaultId: vault.id, enabled })
                  }}
                  size="large"
                />
              </VaultRow>
            ))}
          </VaultListCard>
        </VaultSection>
      )}
    </VStack>
  )
}
