import { Chain } from '@core/chain/Chain'
import { Coin } from '@core/chain/coin/Coin'
import { Opener } from '@lib/ui/base/Opener'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { useCoreViewState } from '../../../../../navigation/hooks/useCoreViewState'
import {
  useCurrentVaultChainCoins,
  useCurrentVaultCoin,
} from '../../../../state/currentVaultCoins'
import { useMergeableTokenBalancesQuery } from '../../../hooks/useMergeableTokenBalancesQuery'
import { Container } from '../../DepositForm.styled'
import { useUnmergeOptions } from './hooks/useUnmergeOptions'
import { UnmergeTokenExplorer } from './UnmergeTokenExplorer'

type Props = {
  selectedCoin: Coin | null
}

export const UnmergeSpecific = ({ selectedCoin }: Props) => {
  const { t } = useTranslation()
  const coins = useCurrentVaultChainCoins(Chain.THORChain)
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const { address } = useCurrentVaultCoin(coinKey)
  const { data: balances = [] } = useMergeableTokenBalancesQuery(address)

  const tokens = useUnmergeOptions({
    coins,
    balances,
  })

  return (
    <VStack gap={12}>
      <Opener
        renderOpener={({ onOpen }) => (
          <Container onClick={onOpen}>
            <HStack alignItems="center" gap={4}>
              <Text weight="400" family="mono" size={16}>
                {selectedCoin?.ticker || t('select_token')}
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
          <UnmergeTokenExplorer value={tokens} onClose={onClose} />
        )}
      />
    </VStack>
  )
}
