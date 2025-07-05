import { Coin, getCoinFromCoinKey } from '@core/chain/coin/Coin'
import { Opener } from '@lib/ui/base/Opener'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useTranslation } from 'react-i18next'

import { Container } from '../../DepositForm.styled'
import { UnmergeTokenExplorer } from './UnmergeTokenExplorer'
import { useCoreViewState } from '../../../../../navigation/hooks/useCoreViewState'
import { useCurrentVaultCoin } from '../../../../state/currentVaultCoins'
import { useDepositFormHandlers } from '../../../providers/DepositFormHandlersProvider'
import { InputFieldWrapper } from '../../DepositForm.styled'
import { useMergeableTokenBalancesQuery } from '../../../hooks/useMergeableTokenBalancesQuery'

type Props = {
  selectedCoin: Coin | null
}

export const UnmergeSpecific = ({ selectedCoin }: Props) => {
  const { t } = useTranslation()
  const [{ register, setValue, watch }] = useDepositFormHandlers()
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const defaultCoin = shouldBePresent(getCoinFromCoinKey(coinKey))
  const coin = selectedCoin || defaultCoin
  const coinAddress = shouldBePresent(useCurrentVaultCoin(coinKey)?.address)
  
  // Fetch all mergeable token balances
  const { data: tokenBalances = [] } = useMergeableTokenBalancesQuery(coinAddress)
  
  // Get the balance for the selected token
  const selectedTokenBalance = selectedCoin 
    ? tokenBalances.find(tb => tb.symbol === selectedCoin.ticker)
    : null
  
  // Convert shares to decimal format (8 decimals for THORChain tokens)
  const sharesInDecimal = selectedTokenBalance 
    ? selectedTokenBalance.shares / 1e8 
    : 0

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
      <InputContainer>
        <Text size={15} weight="400">
          {t('amount')}{' '}
          {selectedTokenBalance && (
            <>
              ({t('balance')}: {sharesInDecimal.toFixed(4)} shares)
            </>
          )}
          <Text as="span" color="danger" size={14}>
            *{' '}
          </Text>{' '}
        </Text>

        <InputFieldWrapper
          as="input"
          step="any"
          min={0.01}
          max={sharesInDecimal || undefined}
          type="number"
          required
          {...register('amount')}
        />
      </InputContainer>
    </VStack>
  )
}
