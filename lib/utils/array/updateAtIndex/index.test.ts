import { describe, expect, it } from 'vitest'

import { updateAtIndex } from '.'

describe('updateAtIndex', () => {
  it('should update the value at the specified index', () => {
    const array = [1, 2, 3]
    const result = updateAtIndex(array, 1, (value: number) => value * 2)
    expect(result).toEqual([1, 4, 3])
  })

  it('should not modify the original array', () => {
    const array = [1, 2, 3]
    const result = updateAtIndex(array, 1, (value: number) => value * 2)
    expect(result).not.toBe(array)
    expect(array).toEqual([1, 2, 3])
  })

  it('should return the same array if the index is out of bounds', () => {
    const array = [1, 2, 3]
    const resultNegativeIndex = updateAtIndex(
      array,
      -1,
      (value: number) => value * 2
    )
    const resultOutOfBounds = updateAtIndex(
      array,
      5,
      (value: number) => value * 2
    )
    expect(resultNegativeIndex).toEqual([1, 2, 3])
    expect(resultOutOfBounds).toEqual([1, 2, 3])
  })

  it('should handle an empty array', () => {
    const array: number[] = []
    const result = updateAtIndex(array, 0, (value: number) => value * 2)
    expect(result).toEqual([])
  })

  it('should allow complex updates to the element', () => {
    const array = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]
    const result = updateAtIndex(array, 1, (item: any) => ({
      ...item,
      name: 'Charlie',
    }))
    expect(result).toEqual([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Charlie' },
    ])
  })

  it('should handle updating an element at the start or end of the array', () => {
    const array = [1, 2, 3]
    const resultStart = updateAtIndex(array, 0, (value: number) => value * 2)
    const resultEnd = updateAtIndex(array, 2, (value: number) => value * 2)
    expect(resultStart).toEqual([2, 2, 3])
    expect(resultEnd).toEqual([1, 2, 6])
  })

  it('should support arrays with mixed data types', () => {
    const array = [1, 'a', true]
    const result = updateAtIndex(array, 1, (value: any) => {
      if (typeof value === 'string') {
        return value + 'b'
      }
      return value
    })
    expect(result).toEqual([1, 'ab', true])
  })
})
