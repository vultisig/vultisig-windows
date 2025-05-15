import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { useEffect } from 'react'
import { UseFormSetValue } from 'react-hook-form'

import { FormData } from '..'

type StakeTCYSpecificProps = {
  setValue: UseFormSetValue<FormData>
}

export const StakeTCYSpecific = ({ setValue }: StakeTCYSpecificProps) => {
  const coins = useCurrentVaultCoins()

  useEffect(() => {
    if (!coins.length) return

    const tcyCoin = coins.find(c => c.id === 'tcy')

    if (tcyCoin) {
      setValue('selectedCoin', tcyCoin, {
        shouldValidate: true,
      })
    }
  }, [coins, setValue])

  return null
}
