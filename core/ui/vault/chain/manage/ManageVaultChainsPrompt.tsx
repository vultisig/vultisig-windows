import { ListAddButton } from '@lib/ui/list/ListAddButton'
import { useTranslation } from 'react-i18next'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'

export const ManageVaultChainsPrompt = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <ListAddButton onClick={() => navigate({ id: 'manageVaultChains' })}>
      {t('choose_chains')}
    </ListAddButton>
  )
}
