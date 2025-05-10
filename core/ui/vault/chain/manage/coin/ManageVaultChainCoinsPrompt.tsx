import { Chain } from '@core/chain/Chain'
import { ListAddButton } from '@lib/ui/list/ListAddButton'
import { ValueProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { useCoreNavigate } from '../../../../navigation/hooks/useCoreNavigate'

export const ManageVaultChainCoinsPrompt = ({ value }: ValueProp<Chain>) => {
  const { t } = useTranslation()

  const navigate = useCoreNavigate()

  return (
    <ListAddButton
      onClick={() =>
        navigate({ id: 'manageVaultChainCoins', state: { chain: value } })
      }
    >
      {t('choose_tokens')}
    </ListAddButton>
  )
}
