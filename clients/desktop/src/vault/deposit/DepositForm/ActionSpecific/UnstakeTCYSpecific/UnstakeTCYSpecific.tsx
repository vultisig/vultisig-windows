import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { chainTokens } from '@core/chain/coin/chainTokens'
import {
  useCurrentVaultAddress,
  useCurrentVaultCoins,
} from '@core/ui/vault/state/currentVaultCoins'
import { InputContainer } from '@lib/ui/inputs/InputContainer'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useEffect } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { FormData } from '../..'
import { InputFieldWrapper } from '../../DepositForm.styled'
import { useUnstakableTcyQuery } from './hooks/useUnstakableTcyQuery'

type Props = {
  setValue: UseFormSetValue<FormData>
}

export const UnstakeTCYSpecific = ({ setValue }: Props) => {
  const { t } = useTranslation()
  const address = useCurrentVaultAddress(Chain.THORChain)
  const { data: unstakableTcy = 0n } = useUnstakableTcyQuery(address!)
  //See if you can handle this getter
  const coin = chainTokens.THORChain!.find(c => c.id === 'tcy')

  // TODO:  Do transactions need to be any different for stake / unstake tyc as per ios / android?

  const coins = useCurrentVaultCoins()

  useEffect(() => {
    if (!coins.length) return

    const tycCoin = coins.find(c => c.id === 'tcy')

    if (tycCoin) {
      setValue('selectedCoin', tycCoin, {
        shouldValidate: true,
      })
    }
  }, [coins, setValue])

  return (
    <VStack gap={12}>
      <InputContainer>
        <Text size={15} weight="400">
          {t('percentage')} (Balance: {0} TYC)
          <Text as="span" color="danger" size={14}>
            *
          </Text>
        </Text>

        <InputFieldWrapper
          as="input"
          onWheel={e => e.currentTarget.blur()}
          name="percentage"
          type="number"
          max={fromChainAmount(unstakableTcy, coin!.decimals)}
          step="0.0001"
          min={0}
        />
      </InputContainer>
    </VStack>
  )
}
