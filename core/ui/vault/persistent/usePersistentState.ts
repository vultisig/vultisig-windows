import { attempt } from '@lib/utils/attempt'
import { useEffect, useState } from 'react'

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
    let isMounted = true
    const initializeValue = async () => {
      const result = await attempt(() => chrome.storage.local.get(key))
      if (result.data) {
        const value = result.data[key]
        if (isMounted) {
          setLocalValue(value ?? initialValue)
        }
      } else {
        if (isMounted) setLocalValue(initialValue)
      }
    }
    initializeValue()
    return () => {
      isMounted = false
    }
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
    await chrome.storage.local.set({ [key]: finalValue })
    setLocalValue(finalValue)
    onValueChange?.(finalValue)
  }

  const clearValue = async () => {
    await chrome.storage.local.remove(key)
    setLocalValue(initialValue)
    onValueChange?.(initialValue)
  }

  return [localValue, setValue, clearValue] as const
}
