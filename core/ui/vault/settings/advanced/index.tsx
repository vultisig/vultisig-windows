import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { SettingsSection } from '@core/ui/settings/SettingsSection'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { IconFileEdit } from '@lib/ui/icons/IconFileEdit'
import { ShareAndroidIcon } from '@lib/ui/icons/ShareAndroidIcon'
import { ShieldIcon } from '@lib/ui/icons/ShieldIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Chain } from '@vultisig/core-chain/Chain'
import { hasServer } from '@vultisig/core-mpc/devices/localPartyId'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import {
  DescriptionText,
  ListItemIconWrapper,
} from '../vaultSettingsListStyles'
import { CustomRpcSettingsRow } from './CustomRpcSettingsRow'

export const VaultSettingsAdvancedPage: FC = () => {
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const navigate = useCoreNavigate()
  const isFastVault = hasServer(vault.signers)
  const ethereumAddress = useCurrentVaultAddress(Chain.Ethereum)
  const canSignCustomMessage = Boolean(ethereumAddress.trim())

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={
          <PageHeaderBackButton
            onClick={() => navigate({ id: 'vaultSettings' })}
          />
        }
        title={t('advanced')}
      />
      <PageContent gap={14} flexGrow scrollable>
        <SettingsSection title={t('advanced')}>
          {!isFastVault && (
            <ListItem
              icon={
                <ListItemIconWrapper>
                  <ShareAndroidIcon />
                </ListItemIconWrapper>
              }
              description={
                <DescriptionText>
                  {t('reshare_vault_description')}
                </DescriptionText>
              }
              onClick={() => navigate({ id: 'reshareVault' })}
              title={t('reshare')}
              hoverable
              showArrow
            />
          )}
          {!vault.publicKeyMldsa && (
            <ListItem
              icon={
                <ListItemIconWrapper>
                  <ShieldIcon />
                </ListItemIconWrapper>
              }
              description={
                <DescriptionText>
                  {t('post_quantum_keygen_description')}
                </DescriptionText>
              }
              onClick={() => navigate({ id: 'qbtcQuantumSecurityOnboarding' })}
              title={t('post_quantum_keygen')}
              hoverable
              showArrow
            />
          )}
          <ListItem
            icon={
              <ListItemIconWrapper>
                <IconFileEdit />
              </ListItemIconWrapper>
            }
            description={
              <DescriptionText>
                {canSignCustomMessage
                  ? t('sign_custom_message_description')
                  : t('sign_custom_message_unavailable_imported_no_ethereum')}
              </DescriptionText>
            }
            onClick={
              canSignCustomMessage
                ? () => navigate({ id: 'signCustomMessage' })
                : undefined
            }
            title={t('sign')}
            hoverable={canSignCustomMessage}
            showArrow={canSignCustomMessage}
          />
          <CustomRpcSettingsRow />
        </SettingsSection>
      </PageContent>
    </VStack>
  )
}
