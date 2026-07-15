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
