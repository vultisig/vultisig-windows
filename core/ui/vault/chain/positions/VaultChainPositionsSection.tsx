import { knownCosmosTokens } from '@core/chain/coin/knownTokens/cosmos'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useCurrentVaultCoins } from '../../state/currentVaultCoins'
import { WithdrawablePositions } from './WithdrawablePositions'

export const VaultChainPositionsSection = () => {
  const coins = useCurrentVaultCoins()
  const { t } = useTranslation()

  const rujiCoin = coins.find(
    coin => coin.ticker === knownCosmosTokens.THORChain['x/ruji'].ticker
  )

  return (
    <Panel withSections>
      <Text size={20} weight={600}>
        {t('positions')}
      </Text>
      {rujiCoin && <WithdrawablePositions value={rujiCoin} />}
    </Panel>
  )
}
