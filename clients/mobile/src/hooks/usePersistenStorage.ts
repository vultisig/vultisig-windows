import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

export enum PersistentStateKey {
  CurrentVaultId = 'currentVaultId',
  IsVaultBalanceVisible = 'isVaultBalanceVisible',
  HasFinishedOnboarding = 'HasFinishedOnboarding',
  Language = 'language',
  FiatCurrency = 'fiatCurrency',
  AddressBook = 'addressBook',
}

export function usePersistentState<T>(
  key: PersistentStateKey,
  defaultValue: T
) {
  const [state, setState] = useState<T>(defaultValue)

  useEffect(() => {
    const loadState = async () => {
      const storedValue = await AsyncStorage.getItem(key)
      if (storedValue !== null) {
        setState(JSON.parse(storedValue))
      } else {
        setState(defaultValue)
      }
    }

    loadState()
  }, [defaultValue, key])

  const updateState = async (value: T) => {
    setState(value)
    await AsyncStorage.setItem(key, JSON.stringify(value))
  }

  return [state, updateState] as const
}
