import {
  StationLegacyWalletClassification,
  StationLegacyWalletStatus,
} from '@clients/extension/src/storage/stationLegacyWalletClassifier'
import { useStationLegacyWalletStorageClassification } from '@clients/extension/src/storage/useStationLegacyWalletStorageClassification'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { currentProductBrand } from '@core/ui/product/brand'
import { Button } from '@lib/ui/buttons/Button'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ListItem } from '@lib/ui/list/item'
import { useNavigate } from '@lib/ui/navigation/hooks/useNavigate'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Panel } from '@lib/ui/panel/Panel'
import { Text, TextColor } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { AppView } from '../../navigation/AppView'
import { shouldShowStationLegacyMigration } from './stationLegacyMigrationGate'

type StationMigrationPageSource = 'setup' | 'settings'

type Props = {
  onSkip?: () => void
  source?: StationMigrationPageSource
}

const walletStatusColor: Record<StationLegacyWalletStatus, TextColor> = {
  supported: 'success',
  reconnect: 'warning',
  unsupported: 'shy',
  corrupt: 'danger',
}

export const StationMigrationPage = ({ onSkip, source = 'setup' }: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate<AppView>()
  const goBack = useNavigateBack()
  const isStationBrand = currentProductBrand === 'station'
  const classification = useStationLegacyWalletStorageClassification({
    enabled: isStationBrand,
  })
  const wallets = classification.wallets

  const shouldShowMigration = shouldShowStationLegacyMigration({
    classification,
    productBrand: currentProductBrand,
  })

  const handleSkip = () => {
    if (onSkip) {
      onSkip()
      return
    }

    navigate(
      source === 'settings'
        ? { id: 'settings' }
        : { id: 'setupVault', state: { skipStationMigration: true } },
      { replace: true }
    )
  }

  const skipLabel =
    source === 'settings'
      ? t('skip_for_now')
      : t('station_migration_set_up_without_migrating')

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={goBack} />}
        title={t('station_migration_title')}
        hasBorder
      />
      <PageContent gap={20} flexGrow scrollable>
        <VStack gap={8}>
          <Text color="contrast" weight={600} size={22} height={1.2}>
            {t('station_migration_review_title')}
          </Text>
          <Text color="shy" size={14} height={1.5}>
            {t('station_migration_review_description')}
          </Text>
        </VStack>

        {shouldShowMigration ? (
          <>
            <MigrationSummary wallets={wallets} />
            <Panel withSections data-testid="station-migration-wallet-list">
              {wallets.map(wallet => (
                <StationMigrationWalletItem
                  key={`${wallet.storageKey}-${wallet.storageIndex ?? 'storage'}`}
                  wallet={wallet}
                />
              ))}
            </Panel>
          </>
        ) : (
          <Panel data-testid="station-migration-empty-state">
            <Text color="shy" size={14} height={1.5}>
              {t('station_migration_no_wallets_found')}
            </Text>
          </Panel>
        )}
      </PageContent>
      <PageFooter>
        <Button kind="secondary" onClick={handleSkip}>
          {skipLabel}
        </Button>
      </PageFooter>
    </VStack>
  )
}

const MigrationSummary = ({
  wallets,
}: {
  wallets: StationLegacyWalletClassification[]
}) => {
  const { t } = useTranslation()
  const supportedCount = wallets.filter(
    wallet => wallet.status === 'supported'
  ).length
  const reconnectCount = wallets.filter(
    wallet => wallet.status === 'reconnect'
  ).length
  const unsupportedCount = wallets.filter(
    wallet => wallet.status === 'unsupported'
  ).length
  const corruptCount = wallets.filter(
    wallet => wallet.status === 'corrupt'
  ).length

  return (
    <SummaryGrid data-testid="station-migration-summary">
      <SummaryItem
        label={t('station_migration_summary_total', {
          count: wallets.length,
        })}
        value={wallets.length}
      />
      <SummaryItem
        label={t('station_migration_status_supported')}
        value={supportedCount}
      />
      <SummaryItem
        label={t('station_migration_status_reconnect')}
        value={reconnectCount}
      />
      <SummaryItem
        label={t('station_migration_status_needs_review')}
        value={unsupportedCount + corruptCount}
      />
    </SummaryGrid>
  )
}

const SummaryItem = ({ label, value }: { label: string; value: number }) => (
  <SummaryCell>
    <Text color="contrast" weight={600} size={18} height={1}>
      {value}
    </Text>
    <Text color="shy" size={11} height={1.2} nowrap>
      {label}
    </Text>
  </SummaryCell>
)

const StationMigrationWalletItem = ({
  wallet,
}: {
  wallet: StationLegacyWalletClassification
}) => {
  const { t } = useTranslation()
  const reason = getWalletReason({ t, wallet })

  return (
    <ListItem
      data-testid="station-migration-wallet-item"
      hoverable={false}
      title={
        <WalletTitleRow>
          <Text color="contrast" size={14} weight={600} height={1.3}>
            {wallet.walletName}
          </Text>
          <StatusBadge>
            <Text
              color={walletStatusColor[wallet.status]}
              size={11}
              weight={600}
              height={1}
              nowrap
            >
              {getWalletStatusLabel({ t, status: wallet.status })}
            </Text>
          </StatusBadge>
        </WalletTitleRow>
      }
      description={
        <VStack gap={4}>
          <Text color="shy" size={12} height={1.35}>
            {getWalletTypeLabel({ t, wallet })}
          </Text>
          <Text color="shy" size={12} height={1.35}>
            {reason}
          </Text>
        </VStack>
      }
      status={wallet.status === 'corrupt' ? 'error' : 'default'}
    />
  )
}

type TranslationInput = {
  t: TFunction
}

const getWalletStatusLabel = ({
  status,
  t,
}: TranslationInput & { status: StationLegacyWalletStatus }) => {
  switch (status) {
    case 'supported':
      return t('station_migration_status_supported')
    case 'reconnect':
      return t('station_migration_status_reconnect')
    case 'unsupported':
      return t('station_migration_status_unsupported')
    case 'corrupt':
      return t('station_migration_status_corrupt')
  }
}

const getWalletTypeLabel = ({
  t,
  wallet,
}: TranslationInput & { wallet: StationLegacyWalletClassification }) => {
  switch (wallet.walletType) {
    case 'mnemonic':
      return t('station_migration_wallet_type_mnemonic')
    case 'seed':
      return t('station_migration_wallet_type_seed')
    case 'privateKey':
      return t('station_migration_wallet_type_private_key')
    case 'interchainPrivateKey':
      return t('station_migration_wallet_type_interchain_private_key')
    case 'legacyPrivateKey':
      return t('station_migration_wallet_type_legacy_private_key')
    case 'ledger':
      return t('station_migration_wallet_type_ledger')
    case 'multisig':
      return t('station_migration_wallet_type_multisig')
    case 'unknown':
      return t('station_migration_wallet_type_unknown')
    case 'corruptStorage':
      return t('station_migration_wallet_type_corrupt_storage')
    case 'corruptWallet':
      return t('station_migration_wallet_type_corrupt_wallet')
  }
}

const getWalletReason = ({
  t,
  wallet,
}: TranslationInput & { wallet: StationLegacyWalletClassification }) => {
  switch (wallet.reasonCode) {
    case 'ledgerReconnectRequired':
      return t('station_migration_reason_ledger_reconnect')
    case 'multisigPublicMetadataOnly':
      return t('station_migration_reason_multisig')
    case 'encryptedSeedNotString':
      return t('station_migration_reason_encrypted_seed_not_string')
    case 'encryptedInvalidShape':
      return t('station_migration_reason_encrypted_invalid_shape')
    case 'encryptedPrivateKeyMissing330':
      return t('station_migration_reason_encrypted_private_key_missing_330')
    case 'legacyWalletBlobNotString':
      return t('station_migration_reason_legacy_wallet_blob_not_string')
    case 'unknownWalletShape':
      return t('station_migration_reason_unknown_wallet_shape')
    case 'malformedJson':
      return t('station_migration_reason_malformed_json', {
        storageKey: wallet.storageKey,
      })
    case 'storageNotArray':
      return t('station_migration_reason_storage_not_array', {
        storageKey: wallet.storageKey,
      })
    case 'walletEntryNotObject':
      return t('station_migration_reason_wallet_entry_not_object')
    default:
      break
  }

  switch (wallet.walletType) {
    case 'mnemonic':
      return t('station_migration_reason_supported_mnemonic')
    case 'seed':
      return t('station_migration_reason_supported_seed')
    case 'privateKey':
      return t('station_migration_reason_supported_private_key')
    case 'interchainPrivateKey':
      return t('station_migration_reason_supported_interchain_private_key')
    case 'legacyPrivateKey':
      return t('station_migration_reason_supported_legacy_private_key')
    default:
      return t('station_migration_reason_unsupported_fallback')
  }
}

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  overflow: hidden;
  border-radius: 8px;
  background: ${getColor('mistExtra')};
`

const SummaryCell = styled(VStack).attrs({
  alignItems: 'center',
  gap: 6,
})`
  min-width: 0;
  padding: 12px 6px;
  background: ${getColor('foreground')};
`

const WalletTitleRow = styled(HStack).attrs({
  alignItems: 'center',
  gap: 8,
  justifyContent: 'space-between',
})`
  width: 100%;
  min-width: 0;
`

const StatusBadge = styled.span`
  flex: 0 0 auto;
  padding: 5px 8px;
  border-radius: 999px;
  background: ${getColor('foregroundExtra')};
`
