import { Dispatch, SetStateAction } from 'react'

export type Stateful<T> = {
  value: T
  setValue: Dispatch<SetStateAction<T>>
}

export const statefulToTuple = <T>({
  value,
  setValue,
}: Stateful<T>): [T, Dispatch<SetStateAction<T>>] => [value, setValue]
