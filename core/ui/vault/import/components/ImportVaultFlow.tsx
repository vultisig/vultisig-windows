import { Vault } from '@core/mpc/vault/Vault'
import {
  FileBasedVaultBackupResult,
  FileBasedVaultBackupResultItem,
} from '@core/ui/vault/import/VaultBackupResult'
import { MatchRecordUnion } from '@lib/ui/base/MatchRecordUnion'
import { ValueTransfer } from '@lib/ui/base/ValueTransfer'
import { useState } from 'react'

import { VaultBackupOverrideProvider } from '../state/vaultBackupOverride'
import { DecryptVaultStep } from './DecryptVaultStep'
import { ProcessVaultContainer } from './ProcessVaultContainer'
import { SaveImportedVaultStep } from './SaveImportedVaultStep'

type ImportVaultFlowProps = {
  renderBackupAcquisitionStep: ({
    onFinish,
  }: {
    onFinish: (result: FileBasedVaultBackupResult) => void
  }) => React.ReactNode
}

export const ImportVaultFlow = ({
  renderBackupAcquisitionStep,
}: ImportVaultFlowProps) => {
  return (
    <ValueTransfer<FileBasedVaultBackupResult>
      from={renderBackupAcquisitionStep}
      to={({ value }) => <ImportVaultSequence items={value} />}
    />
  )
}

const ImportVaultSequence = ({
  items,
}: {
  items: FileBasedVaultBackupResult
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentItem = items[currentIndex]

  if (!currentItem) {
    return null
  }

  const isLast = currentIndex === items.length - 1
  const handleFinish = () => setCurrentIndex(index => index + 1)

  return (
    <VaultBackupOverrideProvider value={currentItem.override ?? null}>
      <ImportVaultResult
        item={currentItem}
        onFinish={isLast ? undefined : handleFinish}
      />
    </VaultBackupOverrideProvider>
  )
}

const ImportVaultResult = ({
  item,
  onFinish,
}: {
  item: FileBasedVaultBackupResultItem
  onFinish?: () => void
}) => {
  return (
    <MatchRecordUnion
      value={item.result}
      handlers={{
        vaultContainer: vaultContainer => (
          <ProcessVaultContainer value={vaultContainer} onFinish={onFinish} />
        ),
        vault: vault => (
          <SaveImportedVaultStep value={vault} onFinish={onFinish} />
        ),
        encryptedVault: encryptedVault => (
          <ValueTransfer<Vault>
            from={({ onFinish: resolve }) => (
              <DecryptVaultStep value={encryptedVault} onFinish={resolve} />
            )}
            to={({ value }) => (
              <SaveImportedVaultStep value={value} onFinish={onFinish} />
            )}
          />
        ),
      }}
    />
  )
}
