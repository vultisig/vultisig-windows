import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { DownloadSeedphraseIcon } from '@lib/ui/icons/DownloadSeedphraseIcon'
import { FileTextIcon } from '@lib/ui/icons/FileTextIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { OnCloseProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { NewBadge } from '../../components/NewBadge'
import { ImportOption } from './ImportOption'

export const ImportOptionModal = ({ onClose }: OnCloseProp) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <Modal onClose={onClose} title={t('recover_vault_or_convert_seedphrase')}>
      <VStack gap={14}>
        <ImportOption
          badge={<NewBadge />}
          icon={<DownloadSeedphraseIcon />}
          title={t('import_seedphrase')}
          onClick={() => {
            navigate({ id: 'importSeedphrase' })
            onClose()
          }}
          description={t('import_seedphrase_description')}
        />

        <ImportOption
          icon={<FileTextIcon />}
          title={t('import_vault_share')}
          onClick={() => {
            navigate({ id: 'importVault' })
            onClose()
          }}
          footnote={t('import_vault_share_supported_files')}
          description={t('import_vault_share_description')}
        />
      </VStack>
    </Modal>
  )
}
