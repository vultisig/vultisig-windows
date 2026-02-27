import { FileBasedVaultBackupResult } from '@core/ui/vault/import/VaultBackupResult'
import { useState } from 'react'

import { VaultBackupOverrideProvider } from '../state/vaultBackupOverride'
import { ImportVaultResult } from './ImportVaultResult'

type ImportVaultSequenceProps = {
  items: FileBasedVaultBackupResult
}

export const ImportVaultSequence = ({ items }: ImportVaultSequenceProps) => {
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
        key={currentIndex}
        item={currentItem}
        onFinish={isLast ? undefined : handleFinish}
      />
    </VaultBackupOverrideProvider>
  )
}
