// @vitest-environment happy-dom

/**
 * A declined popup must reach every dApp as a recognisable rejection, not the
 * bare `"rejectedByUser"` wire sentinel (#5146).
 *
 * Only the extension messaging transport is stubbed. Everything above it — the
 * inpage bridge, `callPopup` and its error translation, and each provider — is
 * the real code, so a provider that lets the rejection propagate is checked
 * against what `callPopup` actually throws, not against a hand-built mock.
 */
import { userRejectedPopupResult } from '@core/inpage-provider/popup/error'
import { SystemProgram, Transaction } from '@solana/web3.js'
import {
  Chain,
  CosmosChain,
  OtherChain,
  UtxoChain,
} from '@vultisig/core-chain/Chain'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSendToBackground = vi.fn()

vi.mock('@lib/extension/bridge/inpage', () => ({
  sendToBackground: (message: unknown) => mockSendToBackground(message),
}))

// Fetches a live priority fee before signing; irrelevant to how a decline
// propagates.
vi.mock(
  '@clients/extension/src/inpage/providers/solana/prepareTransactionForBroadcast',
  () => ({ prepareTransactionForBroadcast: async (tx: unknown) => tx })
)

import { Cosmos } from '@clients/extension/src/inpage/providers/cosmos'
import { MAYAChain } from '@clients/extension/src/inpage/providers/maya'
import { Polkadot } from '@clients/extension/src/inpage/providers/polkadot'
import { Solana } from '@clients/extension/src/inpage/providers/solana'
import { THORChain } from '@clients/extension/src/inpage/providers/thorchain'
import { VultisigTronWeb } from '@clients/extension/src/inpage/providers/tronWeb/tronWeb'
import { UTXO } from '@clients/extension/src/inpage/providers/utxo'
import { XDEFIKeplrProvider } from '@clients/extension/src/inpage/providers/xdefiKeplr'
import { createXrplProvider } from '@clients/extension/src/inpage/providers/xrpl'

const solanaAddress = 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'
const cosmosAddress = 'cosmos1qypqxpq9qcrsszg2pvxq6rs0zqg3yyc5lzv7xu'
const rippleAddress = 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH'
const publicKey = `02${'11'.repeat(32)}`

const addressByChain: Partial<Record<Chain, string>> = {
  [Chain.Solana]: solanaAddress,
  [CosmosChain.Cosmos]: cosmosAddress,
  [OtherChain.Ripple]: rippleAddress,
}

// What the background replies once the popup closes without approval. The
// reply crosses `chrome.runtime`, so it arrives JSON round-tripped.
const declinedPopupReply = JSON.parse(JSON.stringify(userRejectedPopupResult))

const replyFromBackground = (message: Record<string, any>) => {
  if ('popup' in message) {
    return declinedPopupReply
  }

  const { call } = message.background

  if ('getAccount' in call) {
    const address = addressByChain[call.getAccount.chain as Chain]
    return address
      ? { data: { address, publicKey } }
      : { error: 'Unauthorized' }
  }

  if ('getAppChainId' in call) {
    return { data: 'cosmoshub-4' }
  }

  return { error: `Unexpected background call ${Object.keys(call)[0]}` }
}

const expectUserRejection = async (promise: Promise<unknown>) => {
  const error = await promise.then(
    () => {
      throw new Error('Expected the request to be rejected')
    },
    (reason: unknown) => reason
  )

  expect(error).toBeInstanceOf(Error)
  expect(error).toMatchObject({
    code: 4001,
    message: 'User rejected the request',
  })
}

const makeSolanaTransaction = () => {
  const transaction = new Transaction({
    feePayer: SystemProgram.programId,
    recentBlockhash: solanaAddress,
  })
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: SystemProgram.programId,
      toPubkey: SystemProgram.programId,
      lamports: 1,
    })
  )

  return transaction
}

const thorchainDepositTx = {
  from: 'thor1sender',
  to: 'thor1recipient',
  asset: { ticker: 'RUNE' },
  amount: { amount: '1', decimals: 8 },
  memo: '=:BTC.BTC:bc1qrecipient',
}

describe('declining a dApp request', () => {
  beforeEach(() => {
    mockSendToBackground.mockReset()
    mockSendToBackground.mockImplementation(async message =>
      replyFromBackground(message)
    )
  })

  describe('Solana', () => {
    it('rejects signTransaction with 4001', async () => {
      const solana = new Solana('Vultisig')

      await expectUserRejection(solana.signTransaction(makeSolanaTransaction()))
    })

    it('rejects signAndSendTransaction with 4001', async () => {
      const solana = new Solana('Vultisig')

      await expectUserRejection(
        solana.signAndSendTransaction(makeSolanaTransaction())
      )
    })

    it('rejects signMessage with 4001', async () => {
      const solana = new Solana('Vultisig')
      await solana.connect()

      await expectUserRejection(
        solana.signMessage(new TextEncoder().encode('hello'))
      )
    })
  })

  it('rejects Tron trx.sign with 4001', async () => {
    const tronWeb = new VultisigTronWeb()
    const ownerHex = '411111111111111111111111111111111111111111'
    const recipientHex = '413333333333333333333333333333333333333333'

    await expectUserRejection(
      tronWeb.trx.sign({
        txID: '00',
        raw_data_hex: '00',
        visible: false,
        raw_data: {
          contract: [
            {
              type: 'TransferContract',
              parameter: {
                type_url: 'type.googleapis.com/protocol.TransferContract',
                value: {
                  owner_address: ownerHex,
                  to_address: recipientHex,
                  amount: 1,
                },
              },
            },
          ],
          expiration: 1,
          timestamp: 2,
          ref_block_bytes: '0000',
          ref_block_hash: '00'.repeat(8),
        },
      })
    )
  })

  describe.each([
    ['THORChain', () => THORChain.getInstance()],
    ['Maya', () => MAYAChain.getInstance()],
  ])('%s request', (_name, getProvider) => {
    it.each(['send_transaction', 'deposit_transaction'])(
      'rejects %s with 4001 and hands the same error to the callback',
      async method => {
        const callback = vi.fn()

        await expectUserRejection(
          getProvider().request(
            { method, params: [thorchainDepositTx] },
            callback
          )
        )
        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({ code: 4001 })
        )
      }
    )
  })

  describe('Keplr', () => {
    const keplr = () => XDEFIKeplrProvider.getInstance(Cosmos.getInstance())

    it('rejects signAmino with 4001', async () => {
      await expectUserRejection(
        keplr().signAmino('cosmoshub-4', cosmosAddress, {
          chain_id: 'cosmoshub-4',
          account_number: '1',
          sequence: '0',
          fee: { amount: [{ denom: 'uatom', amount: '5000' }], gas: '200000' },
          memo: '',
          msgs: [
            {
              type: 'cosmos-sdk/MsgSend',
              value: {
                from_address: cosmosAddress,
                to_address: cosmosAddress,
                amount: [{ denom: 'uatom', amount: '1' }],
              },
            },
          ],
        })
      )
    })
  })

  it('rejects Bitcoin signPsbt with 4001', async () => {
    const bitcoin = new UTXO(UtxoChain.Bitcoin)

    await expectUserRejection(
      bitcoin.signPsbt({ psbt: Buffer.from('psbt').toString('base64') })
    )
  })

  it('rejects Polkadot signPayload with 4001', async () => {
    await expectUserRejection(
      Polkadot.getInstance().signPayload({
        address: '1polkadotaddress',
        blockHash: `0x${'00'.repeat(32)}`,
        blockNumber: '0x00000001',
        era: '0x00',
        genesisHash: `0x${'00'.repeat(32)}`,
        method: '0x0500',
        nonce: '0x00000000',
        specVersion: '0x00000001',
        tip: '0x00000000000000000000000000000000',
        transactionVersion: '0x00000001',
        signedExtensions: [],
        version: 4,
      })
    )
  })

  it('rejects the XRPL provider signTransaction with 4001', async () => {
    await expectUserRejection(
      createXrplProvider().signTransaction({
        transaction: {
          TransactionType: 'Payment',
          Account: rippleAddress,
          Destination: rippleAddress,
          Amount: '1',
        },
      })
    )
  })
})
