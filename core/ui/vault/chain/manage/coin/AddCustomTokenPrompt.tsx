import { chainsWithTokenMetadataDiscovery } from '@core/chain/coin/token/metadata/chains'
import { ListAddButton } from '@lib/ui/list/ListAddButton'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { useTranslation } from 'react-i18next'

import { useCoreNavigate } from '../../../../navigation/hooks/useCoreNavigate'
import { useCurrentVaultChain } from '../../useCurrentVaultChain'

export const AddCustomTokenPrompt = () => {
  const chain = useCurrentVaultChain()
  const navigate = useCoreNavigate()
  const { t } = useTranslation()

  if (isOneOf(chain, chainsWithTokenMetadataDiscovery)) {
    return (
      <ListAddButton
        onClick={() => navigate({ id: 'addCustomToken', state: { chain } })}
      >
        {t('custom_token')}
      </ListAddButton>
    )
  }
}
