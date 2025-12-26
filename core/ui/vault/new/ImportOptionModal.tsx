import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { FileTextIcon } from '@lib/ui/icons/FileTextIcon'
import { WandSparklesIcon } from '@lib/ui/icons/WandSparklesIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { NewBadge } from '../../components/NewBadge'
import { ImportOption } from './ImportOption'

export const ImportOptionModal = ({ onClose }: OnCloseProp) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <Modal onClose={onClose} title={t('recover_vault_or_convert_seedphrase')}>
      <VStack gap={20}>
        <VStack gap={14}>
          <ImportOption
            badge={<NewBadge />}
            icon={<WandSparklesIcon />}
            title={t('import_seedphrase')}
            onClick={() => {
              navigate({ id: 'importSeedphrase' })
              onClose()
            }}
          >
            <Text size={13} weight="500" color="supporting">
              {t('import_seedphrase_description')}
            </Text>
          </ImportOption>

          <ImportOption
            icon={<FileTextIcon />}
            title={t('import_vault_share')}
            onClick={() => {
              navigate({ id: 'importVault' })
              onClose()
            }}
            footnote={
              <Text size={10} weight="500" color="shy">
                {t('import_vault_share_supported_files')}
              </Text>
            }
          >
            <Text size={13} weight="500" color="supporting">
              {t('import_vault_share_description')}
            </Text>
          </ImportOption>
        </VStack>
      </VStack>
    </Modal>
  )
}
