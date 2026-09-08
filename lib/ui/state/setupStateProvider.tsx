import { ChildrenProp } from '@lib/ui/props'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import {
  Context as ReactContext,
  Dispatch,
  SetStateAction,
  useState,
} from 'react'

import { Stateful, statefulToTuple } from './core'
import { createContextHook } from './createContextHook'
import { createProvidedContext } from './createProvidedContext'

/**
 * Builds a provider, a hook and the backing context for a piece of React state
 * shared through context. The hook throws outside the provider; the context is
 * exposed for the rare consumer that has to tolerate the provider's absence.
 */
export function setupStateProvider<T>(
  contextId: string,
  initialValue: T
): [
  ({
    children,
    initialValue,
  }: ChildrenProp & { initialValue?: T }) => React.JSX.Element,
  () => [T, Dispatch<SetStateAction<T>>],
  ReactContext<Stateful<T> | undefined>,
]
export function setupStateProvider<T>(
  contextId: string
): [
  ({
    children,
    initialValue,
  }: ChildrenProp & { initialValue: T }) => React.JSX.Element,
  () => [T, Dispatch<SetStateAction<T>>],
  ReactContext<Stateful<T> | undefined>,
]
export function setupStateProvider<T>(
  contextId: string,
  initialValue?: T
): [
  ({
    children,
    initialValue,
  }: ChildrenProp & { initialValue?: T }) => React.JSX.Element,
  () => [T, Dispatch<SetStateAction<T>>],
  ReactContext<Stateful<T> | undefined>,
] {
  const Context = createProvidedContext<Stateful<T>>()

  const Provider = ({
    children,
    initialValue: providerInitialValue,
  }: ChildrenProp & { initialValue?: T }) => {
    const [value, setValue] = useState<T>(
      providerInitialValue !== undefined
        ? providerInitialValue
        : shouldBePresent(initialValue, `${contextId} initialValue`)
    )

    return <Context value={{ value, setValue }}>{children}</Context>
  }

  return [
    Provider,
    createContextHook(Context, contextId, statefulToTuple),
    Context,
  ] as const
}
