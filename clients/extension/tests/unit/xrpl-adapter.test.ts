// @vitest-environment happy-dom

/**
 * Protocol contract for the XRPL adapter's GemWallet-compatible bridge.
 *
 * These tests drive the real `@gemwallet/api` SDK — the same package XRPL dApps
 * import — against our injected adapter, so any drift in the wire format (the
 * `messagedId` correlation key, the response envelope, the reject shape) fails
 * here rather than silently making us undetectable.
 */
import { EIP1193Error } from '@clients/extension/src/background/handlers/errorHandler'
import {
  createXrplProvider,
  installXrplAdapter,
} from '@clients/extension/src/inpage/providers/xrpl'
import {
  xrplAppTag,
  xrplRequestSource,
  xrplResponseSource,
} from '@clients/extension/src/inpage/providers/xrpl/protocol'
import {
  buildOfferCancelTx,
  buildOfferCreateTx,
  buildPaymentTx,
  buildTrustSetTx,
} from '@clients/extension/src/inpage/providers/xrpl/transactions'
import {
  cancelOffer,
  createOffer,
  getAddress,
  getNetwork,
  getPublicKey,
  isInstalled,
  sendPayment,
  setTrustline,
  signMessage,
  signTransaction,
  submitTransaction,
} from '@gemwallet/api'
import { OtherChain } from '@vultisig/core-chain/Chain'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const mockRequestAccount = vi.fn()
const mockCallPopup = vi.fn()

vi.mock('@clients/extension/src/inpage/providers/core/requestAccount', () => ({
  requestAccount: (...args: unknown[]) => mockRequestAccount(...args),
}))

vi.mock('@core/inpage-provider/popup', () => ({
  callPopup: (...args: unknown[]) => mockCallPopup(...args),
}))

const address = 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH'
const publicKey =
  '0330e7fc9d56bb25d6893ba3f317ae5bcf33b3291bd63db32654a313222f7fd020'

/**
 * happy-dom delivers `postMessage` with a `source` of its own and on its own
 * schedule. Both details are load-bearing here:
 *
 * - `source` must be the posting window, because the SDK (and our bridge) drop
 *   any message that fails that same-window check.
 * - delivery must be asynchronous, because the SDK posts its request *before*
 *   registering the listener that awaits the reply. A synchronous dispatch
 *   would answer into the void and every call would hang.
 *
 * Re-dispatching this way is what a real browser does, so the round-trip under
 * test is the real one.
 */
const installBrowserFaithfulPostMessage = () => {
  vi.spyOn(window, 'postMessage').mockImplementation((message: unknown) => {
    setTimeout(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: message,
          origin: window.location.origin,
          source: window,
        })
      )
    }, 0)
  })
}

/** Posts a raw envelope the way the SDK does, for types it has no helper for. */
const sendRawRequest = (type: string, payload?: unknown) =>
  new Promise<Record<string, unknown>>(resolve => {
    const messageId = Date.now() + Math.random()

    window.addEventListener('message', function listener(event: MessageEvent) {
      if (event.data?.source !== xrplResponseSource) return
      if (event.data?.messagedId !== messageId) return

      window.removeEventListener('message', listener)
      resolve(event.data)
    })

    window.postMessage(
      {
        source: xrplRequestSource,
        messageId,
        app: xrplAppTag,
        type,
        payload,
      },
      window.location.origin
    )
  })

describe('XRPL adapter (GemWallet-compatible)', () => {
  beforeAll(() => {
    installBrowserFaithfulPostMessage()
    installXrplAdapter()
  })

  beforeEach(() => {
    mockRequestAccount.mockReset()
    mockRequestAccount.mockResolvedValue({ address, publicKey })
    mockCallPopup.mockReset()
    window.gemWallet = true
  })

  describe('detection', () => {
    it('is detected through the window flag the SDK probes first', async () => {
      await expect(isInstalled()).resolves.toEqual({
        result: { isInstalled: true },
      })
    })

    it('is detected over the message protocol when the flag is absent', async () => {
      // The flag short-circuits `isInstalled()`, so drop it to force the SDK
      // down its postMessage path — the one that actually pins the envelope.
      delete window.gemWallet

      await expect(isInstalled()).resolves.toEqual({
        result: { isInstalled: true },
      })
    })
  })

  describe('connect', () => {
    it('getAddress returns the vault XRP address after authorization', async () => {
      await expect(getAddress()).resolves.toEqual({
        type: 'response',
        result: { address },
      })

      expect(mockRequestAccount).toHaveBeenCalledWith(OtherChain.Ripple)
    })

    it('getPublicKey returns the address and uppercase public key', async () => {
      await expect(getPublicKey()).resolves.toEqual({
        type: 'response',
        result: { address, publicKey: publicKey.toUpperCase() },
      })
    })

    it('getNetwork returns the XRPL mainnet descriptor without prompting', async () => {
      await expect(getNetwork()).resolves.toEqual({
        type: 'response',
        result: {
          chain: 'XRPL',
          network: 'Mainnet',
          websocket: 'wss://xrplcluster.com',
        },
      })

      expect(mockRequestAccount).not.toHaveBeenCalled()
    })
  })

  describe('sign and submit', () => {
    const payment = {
      TransactionType: 'Payment',
      Account: address,
      Destination: 'rDestination000000000000000000000000',
      Amount: '1000000',
    } as const
    // base64('vulti') — a stand-in for the signed tx blob the popup returns.
    const encoded = Buffer.from('vulti').toString('base64')
    const hash = 'ABCDEF0123456789'

    beforeEach(() => {
      mockCallPopup.mockResolvedValue([{ hash, data: { encoded } }])
    })

    it('submitTransaction signs, broadcasts, and returns the hash', async () => {
      await expect(
        submitTransaction({ transaction: payment })
      ).resolves.toEqual({ type: 'response', result: { hash } })

      const [, options] = mockCallPopup.mock.calls[0]
      expect(options).toEqual({ account: address })
    })

    it('submitTransaction forwards the transaction on the broadcast path', async () => {
      await submitTransaction({ transaction: payment })

      const [call] = mockCallPopup.mock.calls[0]
      expect(call.sendTx.serialized).toMatchObject({
        chain: OtherChain.Ripple,
        skipBroadcast: false,
      })
      expect(JSON.parse(call.sendTx.serialized.data[0])).toEqual(payment)
    })

    it('signTransaction returns the signed blob as uppercase hex and does not broadcast', async () => {
      await expect(signTransaction({ transaction: payment })).resolves.toEqual({
        type: 'response',
        result: {
          signature: Buffer.from(encoded, 'base64')
            .toString('hex')
            .toUpperCase(),
        },
      })

      const [call] = mockCallPopup.mock.calls[0]
      expect(call.sendTx.serialized.skipBroadcast).toBe(true)
    })

    it('prompts for grant-access before signing', async () => {
      await submitTransaction({ transaction: payment })

      expect(mockRequestAccount).toHaveBeenCalledWith(OtherChain.Ripple)
    })

    it('surfaces a declined signing popup as a reject', async () => {
      mockCallPopup.mockRejectedValue(new EIP1193Error('UserRejectedRequest'))

      await expect(
        submitTransaction({ transaction: payment })
      ).resolves.toEqual({ type: 'reject', result: undefined })
    })

    it('rejects a request whose transaction is null instead of forwarding it', async () => {
      const response = await sendRawRequest('REQUEST_SUBMIT_TRANSACTION/V3', {
        transaction: null,
      })

      expect(response.error).toMatchObject({
        message: expect.stringContaining('missing a transaction'),
      })
      expect(mockCallPopup).not.toHaveBeenCalled()
    })
  })

  describe('sign message', () => {
    // Lowercase-hex signature the keysign popup returns; the bridge uppercases
    // it to match every XRPL verifier's DER encoding.
    const signature = 'abcdef1234567890'

    beforeEach(() => {
      mockCallPopup.mockResolvedValue(signature)
    })

    it('signMessage returns the uppercase signedMessage after authorization', async () => {
      await expect(signMessage('gm from a dApp')).resolves.toEqual({
        type: 'response',
        result: { signedMessage: signature.toUpperCase() },
      })

      expect(mockRequestAccount).toHaveBeenCalledWith(OtherChain.Ripple)
    })

    it('forwards the message to the signMessage popup scoped to the vault', async () => {
      await signMessage('gm from a dApp')

      const [call, options] = mockCallPopup.mock.calls[0]
      expect(call.signMessage.sign_message).toEqual({
        chain: OtherChain.Ripple,
        message: 'gm from a dApp',
        isHex: false,
      })
      expect(options).toEqual({ account: address })
    })

    it('passes the hex flag through when the dApp sets it', async () => {
      await signMessage('deadbeef', true)

      const [call] = mockCallPopup.mock.calls[0]
      expect(call.signMessage.sign_message).toMatchObject({
        message: 'deadbeef',
        isHex: true,
      })
    })

    it('surfaces a declined signing popup as a reject', async () => {
      mockCallPopup.mockRejectedValue(new EIP1193Error('UserRejectedRequest'))

      await expect(signMessage('gm from a dApp')).resolves.toEqual({
        type: 'reject',
        result: undefined,
      })
    })

    it('rejects a request with no message instead of forwarding it', async () => {
      const response = await sendRawRequest('REQUEST_SIGN_MESSAGE/V3', {})

      expect(response.error).toMatchObject({
        message: expect.stringContaining('missing a message'),
      })
      expect(mockCallPopup).not.toHaveBeenCalled()
    })

    it('rejects malformed hex before opening any signing flow', async () => {
      await expect(signMessage('xyz', true)).rejects.toThrow(/malformed/i)

      expect(mockRequestAccount).not.toHaveBeenCalled()
      expect(mockCallPopup).not.toHaveBeenCalled()
    })
  })

  describe('convenience methods', () => {
    const encoded = Buffer.from('vulti').toString('base64')
    const hash = 'DEADBEEF0123456789'
    const issuer = 'rIssuer00000000000000000000000000000'

    beforeEach(() => {
      mockCallPopup.mockResolvedValue([{ hash, data: { encoded } }])
    })

    const builtTx = () =>
      JSON.parse(mockCallPopup.mock.calls[0][0].sendTx.serialized.data[0])

    it('sendPayment builds a Payment, broadcasts, and returns the hash', async () => {
      await expect(
        sendPayment({
          amount: '1000000',
          destination: 'rDestination000000000000000000000000',
          destinationTag: 42,
        })
      ).resolves.toEqual({ type: 'response', result: { hash } })

      expect(mockRequestAccount).toHaveBeenCalledWith(OtherChain.Ripple)
      expect(builtTx()).toMatchObject({
        TransactionType: 'Payment',
        Destination: 'rDestination000000000000000000000000',
        Amount: '1000000',
        DestinationTag: 42,
      })
      expect(
        mockCallPopup.mock.calls[0][0].sendTx.serialized.skipBroadcast
      ).toBe(false)
    })

    it('setTrustline builds a TrustSet with a hex-encoded currency', async () => {
      await expect(
        setTrustline({
          limitAmount: { currency: 'SOLO', issuer, value: '100' },
        })
      ).resolves.toEqual({ type: 'response', result: { hash } })

      expect(builtTx()).toMatchObject({
        TransactionType: 'TrustSet',
        LimitAmount: {
          currency: '534F4C4F00000000000000000000000000000000',
          issuer,
          value: '100',
        },
      })
    })

    it('createOffer builds an OfferCreate with both legs', async () => {
      await expect(
        createOffer({
          takerGets: '1000000',
          takerPays: { currency: 'USD', issuer, value: '1' },
        })
      ).resolves.toEqual({ type: 'response', result: { hash } })

      expect(builtTx()).toMatchObject({
        TransactionType: 'OfferCreate',
        TakerGets: '1000000',
        TakerPays: { currency: 'USD', issuer, value: '1' },
      })
    })

    it('cancelOffer builds an OfferCancel', async () => {
      await expect(cancelOffer({ offerSequence: 7 })).resolves.toEqual({
        type: 'response',
        result: { hash },
      })

      expect(builtTx()).toMatchObject({
        TransactionType: 'OfferCancel',
        OfferSequence: 7,
      })
    })

    it('rejects a malformed payload before opening any signing flow', async () => {
      const response = await sendRawRequest('REQUEST_SEND_PAYMENT/V3', {
        amount: '1000000',
      })

      expect(response.error).toMatchObject({
        message: expect.stringContaining('destination'),
      })
      expect(mockCallPopup).not.toHaveBeenCalled()
    })
  })

  describe('failures', () => {
    it('reports a declined grant as a reject, not a throw', async () => {
      mockRequestAccount.mockRejectedValue(
        new EIP1193Error('UserRejectedRequest')
      )

      await expect(getAddress()).resolves.toEqual({
        type: 'reject',
        result: undefined,
      })
    })

    it('surfaces a genuine failure as a thrown error', async () => {
      mockRequestAccount.mockRejectedValue(new Error('vault is locked'))

      await expect(getAddress()).rejects.toThrow('vault is locked')
    })

    it('answers unsupported methods instead of hanging the dApp', async () => {
      const response = await sendRawRequest('REQUEST_MINT_NFT/V3')

      expect(response.error).toMatchObject({
        message: expect.stringContaining('not supported'),
      })
    })

    it('ignores messages that are not adapter requests', async () => {
      const responses: unknown[] = []
      window.addEventListener('message', (event: MessageEvent) => {
        if (event.data?.source === xrplResponseSource)
          responses.push(event.data)
      })

      window.postMessage({ source: 'SOME_OTHER_WALLET' }, '*')
      await new Promise(resolve => setTimeout(resolve, 20))

      expect(responses).toHaveLength(0)
    })
  })

  it('correlates concurrent requests by message id', async () => {
    // Resolve the address slowly so its reply lands after getNetwork's. If the
    // bridge dropped the id correlation, the SDK would hand the network payload
    // to the address caller.
    mockRequestAccount.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(() => resolve({ address, publicKey }), 30)
        )
    )

    const [addressResponse, networkResponse] = await Promise.all([
      getAddress(),
      getNetwork(),
    ])

    expect(addressResponse.result).toEqual({ address })
    expect(networkResponse.result).toMatchObject({ chain: 'XRPL' })
  })
})

/**
 * The Vultisig-native object API exposed at `window.vultisig.xrpl`. It shares
 * the adapter's operations with the GemWallet postMessage bridge but hands the
 * `result` payloads back directly and rejects (rather than returning a
 * result-less "reject" shape) when the user declines.
 */
describe('window.vultisig.xrpl object API', () => {
  const xrpl = createXrplProvider()

  beforeEach(() => {
    mockRequestAccount.mockReset()
    mockRequestAccount.mockResolvedValue({ address, publicKey })
    mockCallPopup.mockReset()
  })

  it('reports installed and the mainnet descriptor without prompting', async () => {
    await expect(xrpl.isInstalled()).resolves.toBe(true)
    await expect(xrpl.getNetwork()).resolves.toEqual({
      chain: 'XRPL',
      network: 'Mainnet',
      websocket: 'wss://xrplcluster.com',
    })

    expect(mockRequestAccount).not.toHaveBeenCalled()
  })

  it('getAddress returns the vault XRP address after authorization', async () => {
    await expect(xrpl.getAddress()).resolves.toEqual({ address })

    expect(mockRequestAccount).toHaveBeenCalledWith(OtherChain.Ripple)
  })

  it('getPublicKey returns the address and uppercase public key', async () => {
    await expect(xrpl.getPublicKey()).resolves.toEqual({
      address,
      publicKey: publicKey.toUpperCase(),
    })
  })

  it('signMessage returns the uppercase signedMessage', async () => {
    mockCallPopup.mockResolvedValue('abcdef')

    await expect(xrpl.signMessage('gm from a dApp')).resolves.toEqual({
      signedMessage: 'ABCDEF',
    })

    const [call, options] = mockCallPopup.mock.calls[0]
    expect(call.signMessage.sign_message).toEqual({
      chain: OtherChain.Ripple,
      message: 'gm from a dApp',
      isHex: false,
    })
    expect(options).toEqual({ account: address })
  })

  it('submitTransaction signs, broadcasts, and returns the hash', async () => {
    const encoded = Buffer.from('vulti').toString('base64')
    mockCallPopup.mockResolvedValue([{ hash: 'HASH', data: { encoded } }])

    await expect(
      xrpl.submitTransaction({ transaction: { TransactionType: 'Payment' } })
    ).resolves.toEqual({ hash: 'HASH' })

    const [call] = mockCallPopup.mock.calls[0]
    expect(call.sendTx.serialized.skipBroadcast).toBe(false)
  })

  it('signTransaction returns the uppercase blob without broadcasting', async () => {
    const encoded = Buffer.from('vulti').toString('base64')
    mockCallPopup.mockResolvedValue([{ hash: 'HASH', data: { encoded } }])

    await expect(
      xrpl.signTransaction({ transaction: { TransactionType: 'Payment' } })
    ).resolves.toEqual({
      signature: Buffer.from(encoded, 'base64').toString('hex').toUpperCase(),
    })

    const [call] = mockCallPopup.mock.calls[0]
    expect(call.sendTx.serialized.skipBroadcast).toBe(true)
  })

  it('propagates a declined prompt as a rejection', async () => {
    mockRequestAccount.mockRejectedValue(
      new EIP1193Error('UserRejectedRequest')
    )

    await expect(xrpl.getAddress()).rejects.toThrow()
  })

  it('rejects malformed hex without opening any signing flow', async () => {
    await expect(xrpl.signMessage('xyz', true)).rejects.toThrow(/malformed/i)

    expect(mockRequestAccount).not.toHaveBeenCalled()
    expect(mockCallPopup).not.toHaveBeenCalled()
  })

  it('sendPayment builds a Payment and returns the hash', async () => {
    const encoded = Buffer.from('vulti').toString('base64')
    mockCallPopup.mockResolvedValue([{ hash: 'HASH', data: { encoded } }])

    await expect(
      xrpl.sendPayment({
        amount: '1000000',
        destination: 'rDestination000000000000000000000000',
      })
    ).resolves.toEqual({ hash: 'HASH' })

    const tx = JSON.parse(
      mockCallPopup.mock.calls[0][0].sendTx.serialized.data[0]
    )
    expect(tx).toMatchObject({ TransactionType: 'Payment', Amount: '1000000' })
  })
})

/**
 * Pure mapping from the GemWallet convenience-method payloads to XRPL
 * transaction JSON. These need no wallet — the popup fills Account/Fee/Sequence.
 */
describe('XRPL transaction builders', () => {
  const issuer = 'rIssuer00000000000000000000000000000'

  it('buildPaymentTx maps an XRP payment with a destination tag', () => {
    expect(
      buildPaymentTx({
        amount: '1000000',
        destination: 'rDest',
        destinationTag: 42,
      })
    ).toEqual({
      TransactionType: 'Payment',
      Destination: 'rDest',
      Amount: '1000000',
      DestinationTag: 42,
    })
  })

  it('buildPaymentTx hex-encodes a non-standard token currency and maps memos', () => {
    const tx = buildPaymentTx({
      amount: { currency: 'SOLO', issuer, value: '1.5' },
      destination: 'rDest',
      flags: 131072,
      memos: [{ memo: { memoType: 'CD', memoData: 'AB' } }],
    })

    expect(tx.Amount).toEqual({
      currency: '534F4C4F00000000000000000000000000000000',
      issuer,
      value: '1.5',
    })
    expect(tx.Flags).toBe(131072)
    expect(tx.Memos).toEqual([{ Memo: { MemoType: 'CD', MemoData: 'AB' } }])
  })

  it('buildPaymentTx leaves a standard 3-char currency untouched', () => {
    const tx = buildPaymentTx({
      amount: { currency: 'USD', issuer, value: '1' },
      destination: 'rDest',
    })

    expect(tx.Amount).toEqual({ currency: 'USD', issuer, value: '1' })
  })

  it('buildPaymentTx rejects a missing destination', () => {
    expect(() => buildPaymentTx({ amount: '1000000' })).toThrow(/destination/)
  })

  it('buildTrustSetTx requires an issued-currency limit', () => {
    expect(
      buildTrustSetTx({
        limitAmount: { currency: 'USD', issuer, value: '100' },
      })
    ).toEqual({
      TransactionType: 'TrustSet',
      LimitAmount: { currency: 'USD', issuer, value: '100' },
    })
    expect(() => buildTrustSetTx({ limitAmount: '100' })).toThrow(/malformed/i)
  })

  it('buildOfferCreateTx maps both legs', () => {
    expect(
      buildOfferCreateTx({
        takerGets: '1000000',
        takerPays: { currency: 'USD', issuer, value: '1' },
      })
    ).toEqual({
      TransactionType: 'OfferCreate',
      TakerGets: '1000000',
      TakerPays: { currency: 'USD', issuer, value: '1' },
    })
  })

  it('buildOfferCancelTx maps the offer sequence and rejects a missing one', () => {
    expect(buildOfferCancelTx({ offerSequence: 7 })).toEqual({
      TransactionType: 'OfferCancel',
      OfferSequence: 7,
    })
    expect(() => buildOfferCancelTx({})).toThrow(/offerSequence/)
  })
})
