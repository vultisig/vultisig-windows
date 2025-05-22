import { coinKeyToString } from '@core/chain/coin/Coin'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { ManageVaultCoin } from '../../../vault/chain/manage/coin/ManageVaultCoin'
import { useCustomTokenQuery } from './queries/useCustomTokenQuery'

export const CustomTokenResult = ({ address }: { address: string }) => {
  const [{ chain }] = useCoreViewState<'addCustomToken'>()

  const query = useCustomTokenQuery({ chain, address })

  const { t } = useTranslation()

  return (
    <MatchQuery
      value={query}
      error={() => <Text>{t('no_token_found')}</Text>}
      pending={() => <Text>{t('loading')}</Text>}
      success={coin => (
        <ManageVaultCoin key={coinKeyToString(coin)} value={coin} />
      )}
    />
  )
}
