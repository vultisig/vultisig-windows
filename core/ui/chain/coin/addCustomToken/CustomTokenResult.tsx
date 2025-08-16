import { coinKeyToString } from '@core/chain/coin/Coin'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { ManageVaultCoin } from '../../../vault/chain/manage/coin/ManageVaultCoin'
import { useTokenMetadataQuery } from './queries/tokenMetadata'

export const CustomTokenResult = ({ id }: { id: string }) => {
  const [{ chain }] = useCoreViewState<'addCustomToken'>()
  const key = { chain, id } as const

  const query = useTokenMetadataQuery(key)

  const { t } = useTranslation()

  return (
    <MatchQuery
      value={query}
      error={() => <Text>{t('no_token_found')}</Text>}
      pending={() => <Text>{t('loading')}</Text>}
      success={metadata => {
        const coin = { ...key, ...metadata }
        return <ManageVaultCoin key={coinKeyToString(coin)} value={coin} />
      }}
    />
  )
}
