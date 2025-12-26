import { featureFlags } from '@core/ui/featureFlags'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Opener } from '@lib/ui/base/Opener'
import { Button } from '@lib/ui/buttons/Button'
import { useTranslation } from 'react-i18next'

import { ImportOptionModal } from './ImportOptionModal'

export const ImportVaultButton = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <Button
          kind="outlined"
          onClick={() => {
            if (featureFlags.importSeedphrase) {
              onOpen()
            } else {
              navigate({ id: 'importVault' })
            }
          }}
        >
          {t('import_vault')}
        </Button>
      )}
      renderContent={({ onClose }) => <ImportOptionModal onClose={onClose} />}
    />
  )
}
