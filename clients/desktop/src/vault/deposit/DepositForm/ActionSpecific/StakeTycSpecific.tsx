import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { useEffect } from 'react'
import { UseFormSetValue } from 'react-hook-form'

import { FormData } from '..'

type StakeTYCSpecificProps = {
  setValues: UseFormSetValue<FormData>
}

export const StakeTYCSpecific = ({ setValues }: StakeTYCSpecificProps) => {
  const coins = useCurrentVaultCoins()

  useEffect(() => {
    if (!coins.length) return

    const tycCoin = coins.find(c => c.id === 'tcy')

    if (tycCoin) {
      setValues('selectedCoin', tycCoin, {
        shouldValidate: true,
      })
    }
  }, [coins, setValues])

  return null
}
