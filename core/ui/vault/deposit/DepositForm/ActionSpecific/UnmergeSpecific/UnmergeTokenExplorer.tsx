import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { UnmergeExplorerOption } from '@core/ui/vault/deposit/DepositForm/ActionSpecific/UnmergeSpecific/components/UnmergeExplorerOption'
import { formatUnmergeShares } from '@core/ui/vault/deposit/DepositForm/ActionSpecific/UnmergeSpecific/utils'
import { useMergeableTokenBalancesQuery } from '@core/ui/vault/deposit/hooks/useMergeableTokenBalancesQuery'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { OnCloseProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useDepositCoin } from '../../../providers/DepositCoinProvider'

export const UnmergeTokenExplorer = ({
  value: tokens,
  onClose,
}: OnCloseProp & ValueProp<AccountCoin[]>) => {
  const [coin, setDepositCoin] = useDepositCoin()
  const { address } = coin
  const { data: balances = [] } = useMergeableTokenBalancesQuery(address)
  const { t } = useTranslation()

  return (
    <Modal onClose={onClose} title={t('select_token')}>
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
                isActive={coin?.ticker === token.ticker}
                onClick={() => {
                  setDepositCoin(token)
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
