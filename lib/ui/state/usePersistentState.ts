import { attempt } from '@lib/utils/attempt'
import { useEffect, useState } from 'react'

import { getPersistentState } from './persistent/getPersistentState'
import { removePersistentState } from './persistent/removePersistentState'
import { setPersistentState } from './persistent/setPersistentState'

type UsePersistentStateOptions<T> = {
  key: string
  initialValue: T
  onValueChange?: (value: T) => void
}

export function usePersistentState<T>({
  key,
  initialValue,
  onValueChange,
}: UsePersistentStateOptions<T>) {
  const [localValue, setLocalValue] = useState<T>(initialValue)

  useEffect(() => {
    const initializeValue = async () => {
      const result = await attempt(() => getPersistentState(key, initialValue))
      if (result.data) {
        setLocalValue(result.data)
      } else {
        setLocalValue(initialValue)
      }
    }
    initializeValue()
  }, [key, initialValue])

  useEffect(() => {
    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange
    }) => {
      if (key in changes) {
        const newValue = changes[key].newValue
        if (newValue !== undefined) {
          setLocalValue(newValue)
          onValueChange?.(newValue)
        }
      }
    }
    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => chrome.storage.onChanged.removeListener(handleStorageChange)
  }, [key, onValueChange])

  const setValue = async (newValue: T | ((prev: T) => T)) => {
    const finalValue =
      typeof newValue === 'function'
        ? (newValue as (prev: T) => T)(localValue)
        : newValue

    const result = await attempt(() => setPersistentState(key, finalValue))
    if (result.data) {
      setLocalValue(result.data)
      onValueChange?.(result.data)
    }
  }

  const clearValue = async () => {
    const result = await attempt(() => removePersistentState(key))
    if ('data' in result) {
      setLocalValue(initialValue)
      onValueChange?.(initialValue)
    }
  }

  return [localValue, setValue, clearValue] as const
}
