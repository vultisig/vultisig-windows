import { Chain } from '@core/chain/Chain'
import { knownCosmosTokens } from '@core/chain/coin/knownTokens/cosmos'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useCurrentVaultCoins } from '../../state/currentVaultCoins'
import { useCurrentVaultChain } from '../useCurrentVaultChain'
import { WithdrawablePositions } from './WithdrawablePositions'

export const VaultChainPositionsSection = () => {
  const coins = useCurrentVaultCoins()
  const { t } = useTranslation()
  const currentChain = useCurrentVaultChain()

  const rujiCoin = coins.find(
    coin => coin.ticker === knownCosmosTokens.THORChain['x/ruji'].ticker
  )

  if (currentChain !== Chain.THORChain || !rujiCoin) return null

  return (
    <Panel withSections>
      <Text size={20} weight={600}>
        {t('positions')}
      </Text>
      <WithdrawablePositions value={rujiCoin} />
    </Panel>
  )
}
