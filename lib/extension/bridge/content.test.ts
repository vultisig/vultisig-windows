import { describe, expect, it } from 'vitest'

import { isTransientRuntimeMessageError } from './content'

describe('isTransientRuntimeMessageError', () => {
  it.each([
    'Receiving end does not exist.',
    'Could not establish connection. Receiving end does not exist.',
    'The message port closed before a response was received.',
    'Extension context invalidated.',
  ])('treats %s as retryable', error => {
    expect(isTransientRuntimeMessageError(error)).toBe(true)
  })

  it('does not retry arbitrary runtime errors', () => {
    expect(isTransientRuntimeMessageError('Permission denied')).toBe(false)
  })
})
