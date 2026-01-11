import { NewBadge } from '@core/ui/components/NewBadge'
import { featureFlags } from '@core/ui/featureFlags'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Opener } from '@lib/ui/base/Opener'
import { Button } from '@lib/ui/buttons/Button'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ImportOptionModal } from './ImportOptionModal'

const ButtonWrapper = styled.div`
  position: relative;
  flex: 1;
`

const BadgePosition = styled.div`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
`

export const ImportVaultButton = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <ButtonWrapper>
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
          </Button>
          <BadgePosition>
            <NewBadge />
          </BadgePosition>
        </ButtonWrapper>
      )}
      renderContent={({ onClose }) => <ImportOptionModal onClose={onClose} />}
    />
  )
}
