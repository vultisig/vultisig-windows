import { describe, expect, it } from 'vitest'

import { getSignatureTrackedProgress } from './getSignatureTrackedProgress'

const track = (done: number, total: number, startProgress: number) =>
  getSignatureTrackedProgress({ done, total, startProgress })

describe('getSignatureTrackedProgress', () => {
  it('starts where the bar already is', () => {
    expect(track(0, 25, 0)).toBe(0)
    expect(track(0, 25, 14)).toBe(14)
  })

  it('advances an equal share per signature', () => {
    expect(track(1, 25, 0)).toBe(4)
    expect(track(12, 25, 0)).toBe(48)
    expect(track(1, 4, 20)).toBe(40)
    expect(track(3, 4, 20)).toBe(80)
  })

  it('reaches 100 only when every signature is done', () => {
    for (const total of [2, 3, 7, 25, 66, 199, 1000]) {
      for (const startProgress of [0, 1, 14, 50, 89, 90]) {
        for (let done = 0; done < total; done++) {
          expect(track(done, total, startProgress)).toBeLessThan(100)
        }
        expect(track(total, total, startProgress)).toBe(100)
      }
    }
  })

  it('never moves back as signatures finish', () => {
    for (const total of [2, 25, 199]) {
      for (const startProgress of [0, 14, 90]) {
        for (let done = 1; done <= total; done++) {
          expect(track(done, total, startProgress)).toBeGreaterThanOrEqual(
            track(done - 1, total, startProgress)
          )
        }
      }
    }
  })
})
