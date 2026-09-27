import { describe, expect, it } from 'vitest'

import { canUnbondNode } from './parsers'

describe('canUnbondNode', () => {
  it.each(['standby', 'disabled', 'whitelisted', 'Standby', 'DISABLED'])(
    'allows unbonding a %s node',
    status => {
      expect(canUnbondNode(status)).toBe(true)
    }
  )

  it.each(['active', 'ready', 'Ready', 'unknown', '', 'churned out'])(
    'blocks unbonding a "%s" node',
    status => {
      expect(canUnbondNode(status)).toBe(false)
    }
  )
})
