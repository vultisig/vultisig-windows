import { describe, expect, it } from 'vitest'

import { getSeedphraseTargetWordCount } from './getSeedphraseTargetWordCount'

describe('getSeedphraseTargetWordCount', () => {
  it.each([
    [0, 12],
    [12, 12],
    [13, 15],
    [15, 15],
    [16, 18],
    [20, 21],
    [22, 24],
    [24, 24],
    [30, 24],
  ])('shows %i words against %i', (wordCount, target) => {
    expect(getSeedphraseTargetWordCount(wordCount)).toBe(target)
  })
})
