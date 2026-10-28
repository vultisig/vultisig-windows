import { describe, expect, it } from 'vitest'

import { getDeeplinkQueryParams } from './getDeeplinkQueryParams'

describe('getDeeplinkQueryParams', () => {
  it('keeps everything after the first = in a value', () => {
    expect(
      getDeeplinkQueryParams(
        'vultisig://vultisig.com?type=Deposit&memo==:ETH.ETH:0xabc:1=2&amount=1'
      )
    ).toMatchObject({ memo: '=:ETH.ETH:0xabc:1=2', amount: '1' })
  })

  it('returns an empty object without a query string', () => {
    expect(getDeeplinkQueryParams('vultisig://vultisig.com')).toEqual({})
  })
})
