import { FileBasedVaultBackupResult } from '@core/ui/vault/import/VaultBackupResult'
import { useState } from 'react'

import { VaultBackupOverrideProvider } from '../state/vaultBackupOverride'
import { ImportVaultResult } from './ImportVaultResult'
import { SelectVaultBackupFileStep } from './SelectVaultBackupFileStep'

type ImportVaultSequenceProps = {
  items: FileBasedVaultBackupResult
}

export const ImportVaultSequence = ({ items }: ImportVaultSequenceProps) => {
  const [selectedItems, setSelectedItems] =
    useState<FileBasedVaultBackupResult | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const importItems = selectedItems ?? items

  if (!selectedItems && items.length > 1) {
    return (
      <SelectVaultBackupFileStep items={items} onFinish={setSelectedItems} />
    )
  }

  const currentItem = importItems[currentIndex]

  if (!currentItem) {
    return null
  }

  const isLast = currentIndex === importItems.length - 1
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
