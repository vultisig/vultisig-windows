import { parseRippleTx } from '@core/ui/mpc/keysign/tx/ripple/parseRippleTx'
import { describe, expect, it } from 'vitest'

describe('parseRippleTx', () => {
  it('decodes a Payment into destination and XRP amount', () => {
    const data = parseRippleTx(
      JSON.stringify({
        TransactionType: 'Payment',
        Account: 'rSender0000000000000000000000000000',
        Destination: 'rDest0000000000000000000000000000000',
        Amount: '1500000',
        DestinationTag: 42,
      })
    )

    expect(data?.transactionType).toBe('Payment')
    // 1_500_000 drops = 1.5 XRP.
    expect(data?.fields).toContainEqual({
      labelKey: 'ripple_field_amount',
      amount: { kind: 'native', xrp: '1.5' },
    })
    expect(data?.fields).toContainEqual({
      labelKey: 'ripple_field_destination',
      text: 'rDest0000000000000000000000000000000',
    })
    expect(data?.fields).toContainEqual({
      labelKey: 'ripple_field_destination_tag',
      text: '42',
    })
  })

  it('decodes an OfferCreate with both sides, resolving the issued-currency hex code', () => {
    const data = parseRippleTx(
      JSON.stringify({
        TransactionType: 'OfferCreate',
        TakerGets: '10000000',
        TakerPays: {
          currency: '524C555344000000000000000000000000000000',
          issuer: 'rIssuer00000000000000000000000000000',
          value: '5',
        },
      })
    )

    expect(data?.fields).toContainEqual({
      labelKey: 'ripple_field_taker_gets',
      amount: { kind: 'native', xrp: '10' },
    })
    // The 40-char hex currency decodes back to the RLUSD ticker.
    expect(data?.fields).toContainEqual({
      labelKey: 'ripple_field_taker_pays',
      amount: {
        kind: 'issued',
        value: '5',
        currency: 'RLUSD',
        issuer: 'rIssuer00000000000000000000000000000',
      },
    })
  })

  it('decodes a cross-currency Payment swap: receive Amount, pay SendMax', () => {
    const data = parseRippleTx(
      JSON.stringify({
        TransactionType: 'Payment',
        Account: 'rSelf00000000000000000000000000000',
        Destination: 'rSelf00000000000000000000000000000',
        Amount: {
          currency: '524C555344000000000000000000000000000000',
          issuer: 'rIssuer00000000000000000000000000000',
          value: '0.2158',
        },
        SendMax: '200000',
      })
    )

    expect(data?.fields).toContainEqual({
      labelKey: 'ripple_field_amount',
      amount: {
        kind: 'issued',
        value: '0.2158',
        currency: 'RLUSD',
        issuer: 'rIssuer00000000000000000000000000000',
      },
    })
    // 200_000 drops = 0.2 XRP, the maximum the user pays.
    expect(data?.fields).toContainEqual({
      labelKey: 'ripple_field_send_max',
      amount: { kind: 'native', xrp: '0.2' },
    })
  })

  it('returns null for malformed input rather than throwing', () => {
    expect(parseRippleTx('not json')).toBeNull()
    expect(parseRippleTx('{}')).toBeNull()
  })

  it('omits a non-numeric Amount instead of throwing on BigInt', () => {
    // Amount is dApp-controlled and its format is not sanitized upstream, so a
    // bogus drops string must not crash the confirmation render.
    let data
    expect(() => {
      data = parseRippleTx(
        JSON.stringify({
          TransactionType: 'Payment',
          Account: 'rSender0000000000000000000000000000',
          Amount: 'not-a-number',
        })
      )
    }).not.toThrow()

    expect(data?.transactionType).toBe('Payment')
    expect(
      data?.fields.some(field => field.labelKey === 'ripple_field_amount')
    ).toBe(false)
  })
})
