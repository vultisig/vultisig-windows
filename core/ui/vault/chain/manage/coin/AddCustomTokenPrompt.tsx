import { ListAddButton } from '@lib/ui/list/ListAddButton'
import { useTranslation } from 'react-i18next'

import { isCustomTokenEnabledChain } from '../../../../chain/coin/addCustomToken/core/chains'
import { useCoreNavigate } from '../../../../navigation/hooks/useCoreNavigate'
import { useCurrentVaultChain } from '../../useCurrentVaultChain'

export const AddCustomTokenPrompt = () => {
  const chain = useCurrentVaultChain()
  const navigate = useCoreNavigate()
  const { t } = useTranslation()

  if (isCustomTokenEnabledChain(chain)) {
    return (
      <ListAddButton
        onClick={() => navigate({ id: 'addCustomToken', state: { chain } })}
      >
        {t('custom_token')}
      </ListAddButton>
    )
  }
}
