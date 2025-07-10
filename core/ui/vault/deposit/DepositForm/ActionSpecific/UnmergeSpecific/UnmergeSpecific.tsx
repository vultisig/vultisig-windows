import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Coin, getCoinFromCoinKey } from '@core/chain/coin/Coin'
import { Opener } from '@lib/ui/base/Opener'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useTranslation } from 'react-i18next'

import { useCoreViewState } from '../../../../../navigation/hooks/useCoreViewState'
import { useCurrentVaultCoin } from '../../../../state/currentVaultCoins'
import { useMergeableTokenBalancesQuery } from '../../../hooks/useMergeableTokenBalancesQuery'
import { useDepositFormHandlers } from '../../../providers/DepositFormHandlersProvider'
import { Container } from '../../DepositForm.styled'
import { UnmergeTokenExplorer } from './UnmergeTokenExplorer'

type Props = {
  selectedCoin: Coin | null
}

export const UnmergeSpecific = ({ selectedCoin }: Props) => {
  const { t } = useTranslation()
  const [{ setValue, watch }] = useDepositFormHandlers()
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const defaultCoin = shouldBePresent(getCoinFromCoinKey(coinKey))
  const coin = selectedCoin || defaultCoin
  const coinAddress = shouldBePresent(useCurrentVaultCoin(coinKey)?.address)

  // Fetch all mergeable token balances
  const { data: tokenBalances = [] } =
    useMergeableTokenBalancesQuery(coinAddress)

  const selectedTokenBalance = selectedCoin
    ? tokenBalances.find(tb => tb.symbol === selectedCoin.ticker)
    : null

  const sharesInDecimal = selectedTokenBalance
    ? fromChainAmount(selectedTokenBalance.shares, selectedCoin?.decimals || 8)
    : 0
  console.log('🚀 ~ UnmergeSpecific ~ sharesInDecimal:', sharesInDecimal)

  return (
    <VStack gap={12}>
      <Opener
        renderOpener={({ onOpen }) => (
          <Container onClick={onOpen}>
            <HStack alignItems="center" gap={4}>
              <Text weight="400" family="mono" size={16}>
                {coin.ticker || t('select_token')}
              </Text>
              {!selectedCoin && (
                <Text as="span" color="danger" size={14}>
                  *
                </Text>
              )}
            </HStack>
            <IconWrapper style={{ fontSize: 20 }}>
              <ChevronRightIcon />
            </IconWrapper>
          </Container>
        )}
        renderContent={({ onClose }) => (
          <UnmergeTokenExplorer
            setValue={setValue}
            activeOption={watch('selectedCoin')}
            onOptionClick={(token: Coin) => {
              setValue('selectedCoin', token, {
                shouldValidate: true,
              })
              onClose()
            }}
            onClose={onClose}
          />
        )}
      />
    </VStack>
  )
}
