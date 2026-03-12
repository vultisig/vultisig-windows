import { ChildrenProp } from '@lib/ui/props'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { Dispatch, SetStateAction, useState } from 'react'

import { Stateful, statefulToTuple } from './core'
import { createContextHook } from './createContextHook'
import { createProvidedContext } from './createProvidedContext'

export function setupStateProvider<T>(
  contextId: string,
  initialValue: T
): [
  ({
    children,
    initialValue,
  }: ChildrenProp & { initialValue?: T }) => React.JSX.Element,
  () => [T, Dispatch<SetStateAction<T>>],
]
export function setupStateProvider<T>(
  contextId: string
): [
  ({
    children,
    initialValue,
  }: ChildrenProp & { initialValue: T }) => React.JSX.Element,
  () => [T, Dispatch<SetStateAction<T>>],
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
  ] as const
}
