import { Coin } from '@core/chain/coin/Coin'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { OnCloseProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useCoreViewState } from '../../../../../navigation/hooks/useCoreViewState'
import { useMergeableTokenBalancesQuery } from '../../../hooks/useMergeableTokenBalancesQuery'
import { useDepositFormHandlers } from '../../../providers/DepositFormHandlersProvider'
import { UnmergeExplorerOption } from './components/UnmergeExplorerOption'
import { formatUnmergeShares } from './utils'

export const UnmergeTokenExplorer = ({
  value: tokens,
  onClose,
}: OnCloseProp & ValueProp<Coin[]>) => {
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const { address } = useCurrentVaultCoin(coinKey)
  const [{ setValue, watch }] = useDepositFormHandlers()
  const activeOption = watch('selectedCoin')
  const { data: balances = [] } = useMergeableTokenBalancesQuery(address)
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
                  setValue('selectedCoin', token, {
                    shouldValidate: true,
                  })
                  onClose()
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
