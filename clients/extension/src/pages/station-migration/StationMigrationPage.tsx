import {
  setStationLegacyMigrationStatusRecord,
  setStationLegacyMigrationStatusRecords,
  StationLegacyMigrationPersistentStatus,
  StationLegacyMigrationStatusRecord,
} from '@clients/extension/src/storage/stationLegacyMigrationStatus'
import {
  StationLegacyWalletClassification,
  StationLegacyWalletStatus,
} from '@clients/extension/src/storage/stationLegacyWalletClassifier'
import { useStationLegacyMigrationStatusRecords } from '@clients/extension/src/storage/useStationLegacyMigrationStatusRecords'
import { useStationLegacyWalletStorageClassification } from '@clients/extension/src/storage/useStationLegacyWalletStorageClassification'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { currentProductBrand } from '@core/ui/product/brand'
import { Button } from '@lib/ui/buttons/Button'
import { PasswordInput } from '@lib/ui/inputs/PasswordInput'
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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { AppView } from '../../navigation/AppView'
import { shouldShowStationLegacyMigration } from './stationLegacyMigrationGate'
import {
  decryptStationLegacyWallet,
  getStationLegacyWalletId,
  StationLegacyMigrationFailureCode,
  StationLegacyMigrationResult,
} from './stationLegacyWalletMigration'

type StationMigrationPageSource = 'setup' | 'settings'

type Props = {
  onSkip?: () => void
  source?: StationMigrationPageSource
}

const walletStatusColor: Record<StationLegacyWalletStatus, TextColor> = {
  supported: 'success',
  unsupported: 'shy',
  corrupt: 'danger',
}

export const StationMigrationPage = ({ onSkip, source = 'setup' }: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate<AppView>()
  const goBack = useNavigateBack()
  const walletCore = useAssertWalletCore()
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | undefined>()
  const [isChecking, setIsChecking] = useState(false)
  const [results, setResults] = useState<
    Record<string, StationLegacyMigrationResult>
  >({})
  const isStationBrand = currentProductBrand === 'station'
  const classification = useStationLegacyWalletStorageClassification({
    enabled: isStationBrand,
  })
  const migrationStatusRecords = useStationLegacyMigrationStatusRecords({
    enabled: isStationBrand,
  })
  const wallets = classification.wallets

  const shouldShowMigration = shouldShowStationLegacyMigration({
    classification,
    productBrand: currentProductBrand,
  })

  const handleSkip = async () => {
    const updatedAt = Date.now()
    await setStationLegacyMigrationStatusRecords(
      Object.fromEntries(
        supportedWallets.map(wallet => {
          const walletId = getStationLegacyWalletId(wallet)

          return [
            walletId,
            {
              status: 'skipped',
              updatedAt,
              walletId,
              walletName: wallet.walletName,
            } satisfies StationLegacyMigrationStatusRecord,
          ]
        })
      )
    )

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

  const supportedWallets = wallets.filter(wallet => {
    if (wallet.status !== 'supported') return false

    const persistedStatus =
      migrationStatusRecords[getStationLegacyWalletId(wallet)]?.status

    return persistedStatus !== 'migrated' && persistedStatus !== 'skipped'
  })
  const canCheckWallets = supportedWallets.length > 0 && password.length > 0

  const handleCheckWallets = async () => {
    if (!canCheckWallets || isChecking) return

    setPasswordError(undefined)
    setIsChecking(true)
    try {
      const nextResults = await Promise.all(
        supportedWallets.map(wallet =>
          decryptStationLegacyWallet({ wallet, password, walletCore })
        )
      )
      const nextResultRecord = Object.fromEntries(
        nextResults.map(result => [result.walletId, result])
      )
      setResults(nextResultRecord)

      if (nextResults.every(result => result.status === 'failed')) {
        setPasswordError(t('station_migration_password_invalid'))
      }
    } finally {
      setIsChecking(false)
    }
  }

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
            {supportedWallets.length > 0 && (
              <Panel>
                <VStack gap={12}>
                  <VStack gap={4}>
                    <Text color="contrast" weight={600} size={16} height={1.2}>
                      {t('station_migration_password_title')}
                    </Text>
                    <Text color="shy" size={13} height={1.4}>
                      {t('station_migration_password_description')}
                    </Text>
                  </VStack>
                  <PasswordInput
                    value={password}
                    onValueChange={setPassword}
                    label={t('station_migration_password_label')}
                    error={passwordError}
                    validation={passwordError ? 'invalid' : undefined}
                  />
                  <Button
                    loading={isChecking}
                    disabled={!canCheckWallets}
                    onClick={handleCheckWallets}
                  >
                    {t('station_migration_check_wallets')}
                  </Button>
                </VStack>
              </Panel>
            )}
            <Panel withSections data-testid="station-migration-wallet-list">
              {wallets.map(wallet => (
                <StationMigrationWalletItem
                  key={`${wallet.storageKey}-${wallet.storageIndex ?? 'storage'}`}
                  wallet={wallet}
                  result={results[getStationLegacyWalletId(wallet)]}
                  persistedStatus={
                    migrationStatusRecords[getStationLegacyWalletId(wallet)]
                  }
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
  persistedStatus,
  result,
  wallet,
}: {
  persistedStatus?: StationLegacyMigrationStatusRecord
  result?: StationLegacyMigrationResult
  wallet: StationLegacyWalletClassification
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate<AppView>()
  const reason = getWalletReason({ t, wallet })
  const visibleStatus =
    result?.status ?? persistedStatus?.status ?? wallet.status
  const description =
    result?.status === 'failed'
      ? getMigrationFailureReason({
          t,
          failureCode: result.failureCode,
        })
      : persistedStatus
        ? getPersistedStatusReason({
            t,
            status: persistedStatus,
          })
        : reason

  const handleMigrate = async () => {
    if (result?.status !== 'ready') return

    await setStationLegacyMigrationStatusRecord({
      status: 'importing',
      updatedAt: Date.now(),
      walletId: result.walletId,
      walletName: result.walletName,
      source: result.source,
    })

    navigate({
      id: 'setupVault',
      state: {
        keyImportInput: {
          ...result.keyImportInput,
          stationMigration: {
            walletId: result.walletId,
            walletName: result.walletName,
            source: result.source,
          },
        },
        skipStationMigration: true,
      },
    })
  }

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
              color={getVisibleStatusColor(visibleStatus)}
              size={11}
              weight={600}
              height={1}
              nowrap
            >
              {getVisibleStatusLabel({ t, status: visibleStatus })}
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
            {description}
          </Text>
          {result?.status === 'ready' && (
            <Text color="success" size={12} height={1.35}>
              {t('station_migration_ready_source', {
                source: getMigrationSourceLabel({ t, source: result.source }),
              })}
            </Text>
          )}
        </VStack>
      }
      status={wallet.status === 'corrupt' ? 'error' : 'default'}
      extra={
        result?.status === 'ready' ? (
          <Button size="sm" onClick={handleMigrate}>
            {t('station_migration_migrate_wallet')}
          </Button>
        ) : undefined
      }
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
    case 'unsupported':
      return t('station_migration_status_unsupported')
    case 'corrupt':
      return t('station_migration_status_corrupt')
  }
}

type VisibleStatus =
  | StationLegacyWalletStatus
  | StationLegacyMigrationPersistentStatus
  | StationLegacyMigrationResult['status']

const getVisibleStatusColor = (status: VisibleStatus): TextColor => {
  if (status === 'ready') return 'success'
  if (status === 'failed') return 'danger'
  if (status === 'importing') return 'warning'
  if (status === 'migrated') return 'success'
  if (status === 'skipped') return 'shy'

  return walletStatusColor[status]
}

const getVisibleStatusLabel = ({
  status,
  t,
}: TranslationInput & { status: VisibleStatus }) => {
  if (status === 'ready') return t('station_migration_status_ready')
  if (status === 'failed') return t('station_migration_status_failed')
  if (status === 'importing') return t('station_migration_status_importing')
  if (status === 'migrated') return t('station_migration_status_migrated')
  if (status === 'skipped') return t('station_migration_status_skipped')

  return getWalletStatusLabel({ t, status })
}

const getPersistedStatusReason = ({
  status,
  t,
}: TranslationInput & { status: StationLegacyMigrationStatusRecord }) => {
  switch (status.status) {
    case 'importing':
      return t('station_migration_status_reason_importing')
    case 'migrated':
      return t('station_migration_status_reason_migrated')
    case 'skipped':
      return t('station_migration_status_reason_skipped')
    case 'failed':
      return status.failureCode === 'vaultSaveFailed'
        ? t('station_migration_status_reason_vault_save_failed')
        : t('station_migration_status_reason_vault_import_failed')
  }
}

const getMigrationSourceLabel = ({
  source,
  t,
}: TranslationInput & {
  source: Extract<StationLegacyMigrationResult, { status: 'ready' }>['source']
}) => {
  switch (source) {
    case 'mnemonic':
      return t('station_migration_source_mnemonic')
    case 'seed':
      return t('station_migration_source_seed')
    case 'privateKey':
      return t('station_migration_source_private_key')
  }
}

const getMigrationFailureReason = ({
  failureCode,
  t,
}: TranslationInput & { failureCode: StationLegacyMigrationFailureCode }) => {
  switch (failureCode) {
    case 'incorrectPassword':
      return t('station_migration_failure_incorrect_password')
    case 'missingEncryptedValue':
      return t('station_migration_failure_missing_encrypted_value')
    case 'invalidSeed':
      return t('station_migration_failure_invalid_seed')
    case 'invalidLegacyWallet':
      return t('station_migration_failure_invalid_legacy_wallet')
    case 'metadataMismatch':
      return t('station_migration_failure_metadata_mismatch')
    case 'splitInterchainPrivateKeys':
      return t('station_migration_failure_split_interchain_private_keys')
    case 'unsupported':
      return t('station_migration_failure_unsupported')
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
    case 'ledgerPublicMetadataOnly':
      return t('station_migration_reason_ledger_public_metadata_only')
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
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
