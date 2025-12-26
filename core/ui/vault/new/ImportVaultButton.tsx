import { featureFlags } from '@core/ui/featureFlags'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Button } from '@lib/ui/buttons/Button'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ImportOptionModal } from './ImportOptionModal'

export const ImportVaultButton = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (featureFlags.importSeedphrase) {
    return (
      <>
        <Button kind="outlined" onClick={() => setIsModalOpen(true)}>
          {t('import_vault')}
        </Button>
        {isModalOpen && (
          <ImportOptionModal onClose={() => setIsModalOpen(false)} />
        )}
      </>
    )
  }

  return (
    <Button kind="outlined" onClick={() => navigate({ id: 'importVault' })}>
      {t('import_vault')}
    </Button>
  )
}
