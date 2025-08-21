import { Chain } from '@core/chain/Chain'
import { describe, expect, it } from 'vitest'

import { transactionConfig } from '../../DepositConfirmButton/config'

describe('transactionConfig sanity', () => {
  it('uses unbond not unbound', () => {
    const cfg = transactionConfig(Chain.THORChain)
    expect(cfg.unbond).toBeDefined()
    // @ts-expect-error
    expect(cfg.unbound).toBeUndefined()
  })
})
