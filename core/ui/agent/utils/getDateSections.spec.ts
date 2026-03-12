import { describe, expect, it } from 'vitest'

import { getDateSections } from './getDateSections'

const labels = {
  today: 'Today',
  yesterday: 'Yesterday',
  locale: 'en-US',
}

const makeTimestamp = (day: number, hour: number): string =>
  new Date(2026, 2, day, hour, 0, 0).toISOString()

describe('getDateSections', () => {
  const now = new Date(2026, 2, 10, 12, 0, 0)

  it('hides labels for a single today section', () => {
    const result = getDateSections({
      items: [{ id: 'a', timestamp: makeTimestamp(10, 9) }],
      getTimestamp: item => item.timestamp,
      labels,
      now,
    })

    expect(result.showLabels).toBe(false)
    expect(result.sections).toHaveLength(1)
    expect(result.sections[0]?.items).toHaveLength(1)
  })

  it('shows a section for each date boundary in order', () => {
    const result = getDateSections({
      items: [
        { id: 'a', timestamp: makeTimestamp(3, 9) },
        { id: 'b', timestamp: makeTimestamp(3, 10) },
        { id: 'c', timestamp: makeTimestamp(10, 11) },
      ],
      getTimestamp: item => item.timestamp,
      labels,
      now,
    })

    expect(result.showLabels).toBe(true)
    expect(result.sections.map(section => section.label)).toEqual([
      'Mar 3, 2026',
      'Today',
    ])
    expect(result.sections.map(section => section.items.length)).toEqual([2, 1])
  })

  it('falls back to today for invalid timestamps', () => {
    const result = getDateSections({
      items: [{ id: 'a', timestamp: 'not-a-date' }],
      getTimestamp: item => item.timestamp,
      labels,
      now,
    })

    expect(result.sections).toHaveLength(1)
    expect(result.sections[0]?.label).toBe('Today')
    expect(result.sections[0]?.items[0]?.id).toBe('a')
  })
})
