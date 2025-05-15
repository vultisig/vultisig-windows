import { coinKeyToString } from '@core/chain/coin/Coin'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { ManageVaultChainCoin } from '../../../vault/chain/manage/coin/ManageVaultChainCoin'
import { useCustomTokenQuery } from './queries/useCustomTokenQuery'

export const CustomTokenResult = ({ value }: ValueProp<string>) => {
  const [{ chain }] = useCoreViewState<'addCustomToken'>()

  const query = useCustomTokenQuery({ chain, address: value })

  const { t } = useTranslation()

  return (
    <MatchQuery
      value={query}
      error={() => <Text>{t('no_token_found')}</Text>}
      pending={() => <Text>{t('loading')}</Text>}
      success={coin => (
        <ManageVaultChainCoin key={coinKeyToString(coin)} value={coin} />
      )}
    />
  )
}
