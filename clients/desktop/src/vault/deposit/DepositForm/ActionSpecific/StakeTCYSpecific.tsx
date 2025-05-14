import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { useEffect } from 'react'
import { UseFormSetValue } from 'react-hook-form'

import { FormData } from '..'

type StakeTYCSpecificProps = {
  setValue: UseFormSetValue<FormData>
}

export const StakeTCYSpecific = ({ setValue }: StakeTYCSpecificProps) => {
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

  return null
}
