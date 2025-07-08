import { Chain } from '@core/chain/Chain'
import { kujiraCoinsOnThorChain } from '@core/chain/chains/cosmos/thor/kujira-merge/kujiraCoinsOnThorChain'
import { Coin } from '@core/chain/coin/Coin'
import { knownCosmosTokens } from '@core/chain/coin/knownTokens/cosmos'
import {
  useCurrentVaultChainCoins,
  useCurrentVaultCoin,
} from '@core/ui/vault/state/currentVaultCoins'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { FC, useMemo } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useCoreViewState } from '../../../../../navigation/hooks/useCoreViewState'
import { useMergeableTokenBalancesQuery } from '../../../hooks/useMergeableTokenBalancesQuery'
import { FormData } from '../..'
import { DepositActionOption } from '../../DepositActionOption'

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
  const thorChainCoins = useCurrentVaultChainCoins(Chain.THORChain)
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const coinAddress = shouldBePresent(useCurrentVaultCoin(coinKey)?.address)

  // Fetch all mergeable token balances
  const { data: tokenBalances = [] } =
    useMergeableTokenBalancesQuery(coinAddress)

  const tokens = useMemo(() => {
    // Include tokens from kujira migration
    const kujiraTokens = thorChainCoins.filter(
      coin => coin.id in kujiraCoinsOnThorChain
    )

    // Include RUJI token
    const rujiToken = thorChainCoins.find(
      coin => coin.ticker === knownCosmosTokens.THORChain['x/ruji'].ticker
    )

    const allTokens = [...kujiraTokens]
    if (rujiToken) {
      allTokens.push(rujiToken)
    }

    // Filter to only show tokens with balance
    return allTokens.filter(token => {
      const balance = tokenBalances.find(tb => tb.symbol === token.ticker)
      return balance && balance.shares > 0
    })
  }, [thorChainCoins, tokenBalances])
  console.log('🚀 ~ tokens ~ tokens:', tokens)

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
            const balance = tokenBalances.find(tb => tb.symbol === token.ticker)
            return (
              <VStack key={index} gap={8}>
                <DepositActionOption
                  value={token.ticker}
                  isActive={activeOption?.ticker === token.ticker}
                  onClick={() => {
                    onOptionClick(token)
                  }}
                />
                {balance && (
                  <HStack
                    justifyContent="space-between"
                    style={{ paddingLeft: 16, paddingRight: 16 }}
                  >
                    <Text size={14} color="contrast">
                      {t('available')}:
                    </Text>
                    <Text size={14} weight="600">
                      {(balance.shares / 1e8).toFixed(4)} shares
                    </Text>
                  </HStack>
                )}
              </VStack>
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
