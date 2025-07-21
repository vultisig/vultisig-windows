import { Chain } from '@core/chain/Chain'
import { Coin } from '@core/chain/coin/Coin'
import {
  useCurrentVaultChainCoins,
  useCurrentVaultCoin,
} from '@core/ui/vault/state/currentVaultCoins'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useCoreViewState } from '../../../../../navigation/hooks/useCoreViewState'
import { useMergeableTokenBalancesQuery } from '../../../hooks/useMergeableTokenBalancesQuery'
import { FormData } from '../..'
import { UnmergeExplorerOption } from './components/UnmergeExplorerOption'
import { useUnmergeOptions } from './hooks/useUnmergeOptions'
import { formatUnmergeShares } from './utils'
type Props = {
  activeOption?: Coin
  onOptionClick: (option: Coin) => void
  onClose: () => void
  setValue: UseFormSetValue<FormData>
}

export const UnmergeTokenExplorer: FC<Props> = ({
  onClose,
  onOptionClick,
  activeOption,
}) => {
  const coins = useCurrentVaultChainCoins(Chain.THORChain)
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const coinAddress = useCurrentVaultCoin(coinKey)?.address

  const { data: balances = [] } = useMergeableTokenBalancesQuery(coinAddress)

  const tokens = useUnmergeOptions({
    coins,
    balances,
  })

  const { t } = useTranslation()

  return (
    <Modal
      width={480}
      placement="top"
      title={t('select_token')}
      onClose={onClose}
    >
      <VStack gap={20}>
        {tokens.length > 0 ? (
          tokens.map((token, index) => {
            const balance = balances.find(tb => tb.symbol === token.ticker)
            return (
              <UnmergeExplorerOption
                key={index}
                value={{
                  ticker: token.ticker,
                  balance: `${balance?.shares ? formatUnmergeShares(balance.shares) : 0} shares`,
                }}
                isActive={activeOption?.ticker === token.ticker}
                onClick={() => {
                  onOptionClick(token)
                }}
              />
            )
          })
        ) : (
          <Text size={16} color="contrast">
            {t('no_mergeable_tokens_found')}
          </Text>
        )}
      </VStack>
    </Modal>
  )
}
