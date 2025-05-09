import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { ListAddButton } from '@lib/ui/list/ListAddButton'
import { useTranslation } from 'react-i18next'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'

export const ManageVaultChainsPrompt = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <UnstyledButton onClick={() => navigate('manageVaultChains')}>
      <ListAddButton as="div">{t('choose_chains')}</ListAddButton>
    </UnstyledButton>
  )
}
