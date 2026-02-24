import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined'
import { attempt } from '@lib/utils/attempt'
import type { Defined } from '@lib/utils/types/Defined'
import { useCallback, useSyncExternalStore } from 'react'

import { PersistentStorage } from './PersistentStorage'

export function createPersistentStateHook<T extends string = string>(
  storage: PersistentStorage<T>
) {
  const validatedKeys = new Set<T>()

  function usePersistentState<V>(
    key: T,
    initialValue: Defined<V> | (() => Defined<V>),
    validate?: (value: Defined<V>) => Defined<V> | void
  ): [
    Defined<V>,
    (value: Defined<V> | ((prevState: Defined<V>) => Defined<V>)) => void,
  ] {
    const subscribe = useCallback(
      (onStoreChange: () => void) => {
        const listener = () => {
          onStoreChange()
        }
        storage.addValueChangeListener(key, listener)
        return () => {
          storage.removeValueChangeListener(key, listener)
        }
      },
      [key]
    )

    const resolveInitial = useCallback(() => {
      const resolved =
        typeof initialValue === 'function'
          ? (initialValue as () => Defined<V>)()
          : initialValue
      storage.setItem(key, resolved)
      return resolved
    }, [key, initialValue])

    const getSnapshot = useCallback(() => {
      const value = storage.getItem<V>(key)

      if (value === undefined) {
        return resolveInitial()
      }

      const definedValue = value as Defined<V>

      if (validate && !validatedKeys.has(key)) {
        validatedKeys.add(key)
        const result = attempt(() => validate(definedValue))
        if ('data' in result) {
          const corrected = result.data
          if (corrected !== undefined) {
            storage.setItem(key, corrected)
            return corrected
          }
        } else {
          return resolveInitial()
        }
      }

      return definedValue
    }, [key, validate, resolveInitial])

    const getServerSnapshot = useCallback(() => {
      const resolvedInitialValue =
        typeof initialValue === 'function'
          ? (initialValue as () => Defined<V>)()
          : initialValue
      return resolvedInitialValue
    }, [initialValue])

    const value = useSyncExternalStore(
      subscribe,
      getSnapshot,
      getServerSnapshot
    )

    const setPersistentStorageValue = useCallback(
      (newValue: Defined<V> | ((prevState: Defined<V>) => Defined<V>)) => {
        const currentValue = shouldBeDefined(storage.getItem<V>(key))
        const resolvedValue =
          typeof newValue === 'function'
            ? (newValue as (prevState: Defined<V>) => Defined<V>)(
                currentValue as Defined<V>
              )
            : newValue
        storage.setItem(key, resolvedValue)
      },
      [key]
    )

    return [value, setPersistentStorageValue]
  }

  return usePersistentState
}
