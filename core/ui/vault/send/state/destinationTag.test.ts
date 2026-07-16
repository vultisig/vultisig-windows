import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { getSendDestinationTag } from './destinationTag'

const taggedXAddress = 'XV5sbjUmgPpvXv4ixFWZ5ptAYZ6PD2q1qM6owqNbug8W6KV'

describe('getSendDestinationTag', () => {
  it('derives and locks the embedded X-address tag without replacing the manual value', () => {
    const manualValue = '12345'

    expect(
      getSendDestinationTag({
        chain: Chain.Ripple,
        receiver: taggedXAddress,
        value: manualValue,
      })
    ).toEqual({
      destinationTag: 495,
      error: false,
      isLocked: true,
      value: '495',
    })

    expect(
      getSendDestinationTag({
        chain: Chain.Ripple,
        receiver: 'rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY',
        value: manualValue,
      })
    ).toEqual({
      destinationTag: 12345,
      error: false,
      isLocked: false,
      value: manualValue,
    })
  })

  it.each([
    ['0', 0],
    ['4294967295', 4294967295],
  ])('accepts the uint32 boundary %s', (value, destinationTag) => {
    expect(
      getSendDestinationTag({
        chain: Chain.Ripple,
        receiver: 'rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY',
        value,
      })
    ).toMatchObject({ destinationTag, error: false, isLocked: false })
  })

  it.each(['-1', '1.5', '4294967296', '12345678901', 'invoice'])(
    'rejects the invalid tag %s',
    value => {
      expect(
        getSendDestinationTag({
          chain: Chain.Ripple,
          receiver: 'rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY',
          value,
        })
      ).toMatchObject({ destinationTag: undefined, error: true })
    }
  )

  it('does not interpret destination tags on another chain', () => {
    expect(
      getSendDestinationTag({
        chain: Chain.Ethereum,
        receiver: taggedXAddress,
        value: '12345',
      })
    ).toEqual({
      destinationTag: undefined,
      error: false,
      isLocked: false,
      value: '12345',
    })
  })
})
