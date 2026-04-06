import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { groupByDate } from './groupByDate'

const labels = {
  today: 'Today',
  yesterday: 'Yesterday',
  locale: 'en-US',
}

const getTimestamp = (item: { timestamp: string }) => item.timestamp

const makeItem = (timestamp: string) => ({ timestamp })

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-03-11T12:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('groupByDate', () => {
  it('labels items from today as "Today"', () => {
    const items = [makeItem('2026-03-11T08:00:00Z')]
    const result = groupByDate({ items, getTimestamp, labels })

    expect(result).toHaveLength(1)
    expect(result[0].label).toBe('Today  Mar 11, 2026')
    expect(result[0].items).toHaveLength(1)
  })

  it('labels items from yesterday as "Yesterday"', () => {
    const items = [makeItem('2026-03-10T15:00:00Z')]
    const result = groupByDate({ items, getTimestamp, labels })

    expect(result).toHaveLength(1)
    expect(result[0].label).toBe('Yesterday  Mar 10, 2026')
  })

  it('uses locale-formatted date for older items', () => {
    const items = [makeItem('2026-03-05T10:00:00Z')]
    const result = groupByDate({ items, getTimestamp, labels })

    expect(result).toHaveLength(1)
    expect(result[0].label).toBe('March 5')
  })

  it('includes year for cross-year dates', () => {
    const items = [makeItem('2025-12-25T10:00:00Z')]
    const result = groupByDate({ items, getTimestamp, labels })

    expect(result).toHaveLength(1)
    expect(result[0].label).toBe('December 25, 2025')
  })

  it('groups multiple items from the same day together', () => {
    const items = [
      makeItem('2026-03-11T08:00:00Z'),
      makeItem('2026-03-11T14:00:00Z'),
      makeItem('2026-03-11T20:00:00Z'),
    ]
    const result = groupByDate({ items, getTimestamp, labels })

    expect(result).toHaveLength(1)
    expect(result[0].label).toBe('Today  Mar 11, 2026')
    expect(result[0].items).toHaveLength(3)
  })

  it('sorts items newest-first within each group', () => {
    const items = [
      makeItem('2026-03-11T08:00:00Z'),
      makeItem('2026-03-11T20:00:00Z'),
      makeItem('2026-03-11T14:00:00Z'),
    ]
    const result = groupByDate({ items, getTimestamp, labels })

    expect(result[0].items[0].timestamp).toBe('2026-03-11T20:00:00Z')
    expect(result[0].items[1].timestamp).toBe('2026-03-11T14:00:00Z')
    expect(result[0].items[2].timestamp).toBe('2026-03-11T08:00:00Z')
  })

  it('creates separate groups per date, ordered newest-first', () => {
    const items = [
      makeItem('2026-03-09T10:00:00Z'),
      makeItem('2026-03-11T10:00:00Z'),
      makeItem('2026-03-10T10:00:00Z'),
    ]
    const result = groupByDate({ items, getTimestamp, labels })

    expect(result).toHaveLength(3)
    expect(result[0].label).toBe('Today  Mar 11, 2026')
    expect(result[1].label).toBe('Yesterday  Mar 10, 2026')
    expect(result[2].label).toBe('March 9')
  })

  it('returns empty array for empty items', () => {
    const result = groupByDate({ items: [], getTimestamp, labels })
    expect(result).toEqual([])
  })
})
