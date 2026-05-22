import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { FileBasedVaultBackupResult } from '@core/ui/vault/import/VaultBackupResult'
import { Button } from '@lib/ui/buttons/Button'
import { getFormProps } from '@lib/ui/form/utils/getFormProps'
import { RadioOptionsList } from '@lib/ui/inputs/RadioOptionsList'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type SelectVaultBackupFileStepProps =
  OnFinishProp<FileBasedVaultBackupResult> & {
    items: FileBasedVaultBackupResult
  }

export const SelectVaultBackupFileStep = ({
  items,
  onFinish,
}: SelectVaultBackupFileStepProps) => {
  const { t } = useTranslation()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    items.length ? 0 : null
  )

  const indexes = items.map((_, index) => index)
  const selectedItem = selectedIndex === null ? undefined : items[selectedIndex]

  return (
    <>
      <FlowPageHeader title={t('select_vault_backup_share')} />
      <PageContent
        as="form"
        {...getFormProps({
          onSubmit: () => {
            if (selectedItem) {
              onFinish([selectedItem])
            }
          },
          isDisabled: !selectedItem,
        })}
      >
        <VStack gap={20} flexGrow>
          <Text color="supporting">
            {t('select_vault_backup_share_description')}
          </Text>
          <RadioOptionsList<number>
            value={selectedIndex}
            onChange={setSelectedIndex}
            options={indexes}
            renderOption={index => (
              <Text cropped color="regular" size={14} weight="500">
                {items[index]?.name}
              </Text>
            )}
          />
        </VStack>
        <Button disabled={!selectedItem} type="submit">
          {t('continue')}
        </Button>
      </PageContent>
    </>
  )
}
