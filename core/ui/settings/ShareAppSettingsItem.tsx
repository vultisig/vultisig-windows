import { Opener } from '@lib/ui/base/Opener'
import { ShareUpRight2Icon } from '@lib/ui/icons/ShareUpRight2Icon'
import { useTranslation } from 'react-i18next'

import { SettingsItem } from './SettingsItem'
import { ShareAppModal } from './share-app/ShareAppModal'

/** Settings row that opens the share-the-app sheet. */
export const ShareAppSettingsItem = () => {
  const { t } = useTranslation()

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <SettingsItem
          icon={<ShareUpRight2Icon />}
          onClick={onOpen}
          title={t('share_app')}
        />
      )}
      renderContent={({ onClose }) => <ShareAppModal onClose={onClose} />}
    />
  )
}
