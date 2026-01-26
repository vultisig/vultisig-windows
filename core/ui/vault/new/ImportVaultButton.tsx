import { NewBadge } from '@core/ui/components/NewBadge'
import { featureFlags } from '@core/ui/featureFlags'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Opener } from '@lib/ui/base/Opener'
import { Button } from '@lib/ui/buttons/Button'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ImportOptionModal } from './ImportOptionModal'

const Badge = styled(NewBadge)`
  position: absolute;
  right: 16px;
`

export const ImportVaultButton = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <Button
          kind="secondary"
          onClick={() => {
            if (featureFlags.importSeedphrase) {
              onOpen()
            } else {
              navigate({ id: 'importVault' })
            }
          }}
        >
          {t('import')}
          {featureFlags.importSeedphrase && <Badge />}
        </Button>
      )}
      renderContent={({ onClose }) => <ImportOptionModal onClose={onClose} />}
    />
  )
}
