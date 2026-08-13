import { sanitizeRippleDappTx } from '@core/inpage-provider/popup/view/resolvers/sendTx/core/ripple/sanitizeRippleDappTx'
import { describe, expect, it } from 'vitest'

const vaultAddress = 'rVaULT00000000000000000000000000000'

const sanitize = (tx: unknown) =>
  sanitizeRippleDappTx({
    rawJson: JSON.stringify(tx),
    accountAddress: vaultAddress,
  })

describe('sanitizeRippleDappTx', () => {
  it('fills Account from the vault when the dApp omits it', () => {
    const result = sanitize({
      TransactionType: 'Payment',
      Destination: 'rDest0000000000000000000000000000000',
      Amount: '1000000',
    })

    expect(result.Account).toBe(vaultAddress)
    expect(result.Destination).toBe('rDest0000000000000000000000000000000')
  })

  it('accepts an Account that already matches the vault', () => {
    const result = sanitize({
      TransactionType: 'Payment',
      Account: vaultAddress,
      Amount: '1000000',
    })

    expect(result.Account).toBe(vaultAddress)
  })

  it('rejects a transaction that names a different sender', () => {
    // Silently rewriting the sender to our vault would change who the tx is
    // from out from under the user, so a mismatch must be refused outright.
    expect(() =>
      sanitize({
        TransactionType: 'Payment',
        Account: 'rATTACKER0000000000000000000000000',
        Amount: '1000000',
      })
    ).toThrow(/does not match/)
  })

  it('strips signer and signature fields the page must not set', () => {
    const result = sanitize({
      TransactionType: 'Payment',
      Amount: '1000000',
      SigningPubKey: 'DEADBEEF',
      TxnSignature: 'CAFE',
      Signers: [{ Signer: {} }],
    })

    expect(result).not.toHaveProperty('SigningPubKey')
    expect(result).not.toHaveProperty('TxnSignature')
    expect(result).not.toHaveProperty('Signers')
  })

  it('accepts each allowlisted transaction type', () => {
    for (const TransactionType of [
      'Payment',
      'OfferCreate',
      'OfferCancel',
      'TrustSet',
    ]) {
      expect(sanitize({ TransactionType }).TransactionType).toBe(
        TransactionType
      )
    }
  })

  it('rejects a transaction type outside the allowlist', () => {
    // SetRegularKey could hand account control to an attacker key — exactly the
    // kind of request that must never ride in on a "sign this swap" prompt.
    expect(() => sanitize({ TransactionType: 'SetRegularKey' })).toThrow(
      /not supported/
    )
  })

  it('rejects a transaction with no TransactionType', () => {
    expect(() => sanitize({ Amount: '1000000' })).toThrow(/TransactionType/)
  })

  it('rejects non-object and non-JSON input', () => {
    expect(() =>
      sanitizeRippleDappTx({ rawJson: '"just a string"', accountAddress: vaultAddress })
    ).toThrow(/must be a JSON object/)
    expect(() =>
      sanitizeRippleDappTx({ rawJson: 'not json', accountAddress: vaultAddress })
    ).toThrow(/not valid JSON/)
  })

  it('rejects a partial payment that sets no delivery floor', () => {
    // tfPartialPayment makes Amount a ceiling: the ledger delivers whatever the
    // path can source and records it only in metadata. With no DeliverMin the
    // user can be charged SendMax and receive dust, and the confirmation screen
    // has no honest figure to show — so this never reaches the signer.
    expect(() =>
      sanitize({
        TransactionType: 'Payment',
        Destination: vaultAddress,
        Amount: {
          currency: '524C555344000000000000000000000000000000',
          issuer: 'rIssuer00000000000000000000000000000',
          value: '500',
        },
        SendMax: '200000000',
        Flags: 131072,
      })
    ).toThrow(/DeliverMin/)
  })

  it('accepts a partial payment that bounds delivery with DeliverMin', () => {
    const result = sanitize({
      TransactionType: 'Payment',
      Destination: vaultAddress,
      Amount: '1000000',
      SendMax: '1200000',
      DeliverMin: '950000',
      Flags: 131072,
    })

    expect(result.Flags).toBe(131072)
    expect(result.DeliverMin).toBe('950000')
  })

  it.each([
    ['null', null],
    ['an empty object', {}],
    [
      'an issued-currency object missing its value',
      { currency: 'USD', issuer: 'rIssuer00000000000000000000000000000' },
    ],
    ['a non-numeric drops string', 'not-a-number'],
    ['zero drops', '0'],
    [
      'a zero issued-currency value',
      {
        currency: 'USD',
        issuer: 'rIssuer00000000000000000000000000000',
        value: '0',
      },
    ],
  ])(
    'rejects a partial payment whose DeliverMin is %s',
    (_label, DeliverMin) => {
      // Each of these satisfies "the field is present" while flooring nothing,
      // so presence alone cannot stand in for a delivery floor.
      expect(() =>
        sanitize({
          TransactionType: 'Payment',
          Destination: vaultAddress,
          Amount: '1000000',
          SendMax: '1200000',
          DeliverMin,
          Flags: 131072,
        })
      ).toThrow(/DeliverMin/)
    }
  )

  it('accepts a partial payment floored by an issued-currency DeliverMin', () => {
    const deliverMin = {
      currency: '524C555344000000000000000000000000000000',
      issuer: 'rIssuer00000000000000000000000000000',
      value: '1.5',
    }

    const result = sanitize({
      TransactionType: 'Payment',
      Destination: vaultAddress,
      Amount: {
        currency: '524C555344000000000000000000000000000000',
        issuer: 'rIssuer00000000000000000000000000000',
        value: '2',
      },
      SendMax: '1200000',
      DeliverMin: deliverMin,
      Flags: 131072,
    })

    expect(result.DeliverMin).toEqual(deliverMin)
  })

  it('leaves tfPartialPayment alone on a non-Payment transaction', () => {
    // 0x00020000 is tfPartialPayment only on a Payment; on an OfferCreate the
    // same bit is tfImmediateOrCancel and says nothing about delivery.
    expect(
      sanitize({ TransactionType: 'OfferCreate', Flags: 131072 }).Flags
    ).toBe(131072)
  })

  it('passes through flags that do not touch delivery', () => {
    // tfFullyCanonicalSig — set by most clients, and above INT32_MAX, so the
    // uint32 bound must not clip it.
    expect(
      sanitize({
        TransactionType: 'Payment',
        Amount: '1000000',
        Flags: 2147483648,
      }).Flags
    ).toBe(2147483648)
  })

  it('rejects Flags the XRPL codec cannot encode as a uint32', () => {
    // Some client libraries accept `{ tfPartialPayment: true }` sugar. Passing
    // an undecodable Flags on would mean signing flags we never evaluated.
    expect(() =>
      sanitize({
        TransactionType: 'Payment',
        Amount: '1000000',
        Flags: { tfPartialPayment: true },
      })
    ).toThrow(/uint32/)

    expect(() =>
      sanitize({
        TransactionType: 'Payment',
        Amount: '1000000',
        Flags: '131072',
      })
    ).toThrow(/uint32/)

    expect(() =>
      sanitize({
        TransactionType: 'Payment',
        Amount: '1000000',
        Flags: -1,
      })
    ).toThrow(/uint32/)
  })

  it('preserves dApp-supplied Paths so the confirmation screen can surface them', () => {
    // Paths are legitimate on a cross-currency payment, so they are shown
    // rather than refused — but they must survive verbatim to be shown at all.
    const paths = [
      [{ currency: 'USD', issuer: 'rIssuer00000000000000000000000000000' }],
    ]

    const result = sanitize({
      TransactionType: 'Payment',
      Destination: vaultAddress,
      Amount: '1000000',
      SendMax: '1200000',
      Paths: paths,
    })

    expect(result.Paths).toEqual(paths)
  })

  it('preserves the value-bearing fields of an OfferCreate', () => {
    const takerGets = '10000000'
    const takerPays = {
      currency: '524C555344000000000000000000000000000000',
      issuer: 'rIssuer00000000000000000000000000000',
      value: '5',
    }

    const result = sanitize({
      TransactionType: 'OfferCreate',
      TakerGets: takerGets,
      TakerPays: takerPays,
    })

    expect(result).toMatchObject({
      TransactionType: 'OfferCreate',
      Account: vaultAddress,
      TakerGets: takerGets,
      TakerPays: takerPays,
    })
  })
})
