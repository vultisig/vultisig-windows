import { callBackground } from '@core/inpage-provider/background'
import { callPopup } from '@core/inpage-provider/popup'
import { PopupError } from '@core/inpage-provider/popup/error'
import { ITransactionPayload } from '@core/inpage-provider/popup/view/resolvers/sendTx/interfaces'
import { Address } from '@ton/core'
import type {
  AppRequest,
  ConnectEvent,
  ConnectItemReply,
  ConnectRequest,
  DeviceInfo,
  RpcMethod,
  SEND_TRANSACTION_ERROR_CODES,
  SIGN_DATA_ERROR_CODES,
  SignDataPayload,
  WalletEvent,
  WalletResponse,
} from '@tonconnect/protocol'
import { CHAIN } from '@tonconnect/protocol'
import { Chain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { attempt } from '@vultisig/lib-utils/attempt'

import { getWalletStateInit } from './getWalletStateInit'
import { buildSignDataCellHash, buildSignDataTextBinaryHash } from './signData'
import {
  buildTonProofPayload,
  formatTonProofReply,
  getTonProofHash,
} from './tonProof'
import {
  getTonConnectDeviceInfo,
  getTonConnectWalletInfo,
} from './walletManifest'

type TonConnectCallback = (event: WalletEvent) => void
type TonConnectMessage = {
  address: string
  amount: string
  payload?: string
  stateInit?: string
}

type TonConnectSendTransactionPayload = {
  valid_until: number
  network?: string
  from?: string
  messages: TonConnectMessage[]
}

export class TonConnectBridge {
  deviceInfo: DeviceInfo = getTonConnectDeviceInfo()

  walletInfo = getTonConnectWalletInfo()

  protocolVersion = 2
  isWalletBrowser = false

  private listeners: TonConnectCallback[] = []
  private nextEventId = 1

  listen(callback: TonConnectCallback): () => void {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  private emit(event: WalletEvent): void {
    this.listeners.forEach(cb => cb(event))
  }

  async disconnect(): Promise<void> {
    const { error } = await attempt(callBackground({ signOut: {} }))

    if (error) {
      console.error('Failed to sign out on disconnect:', error)
    }

    this.emit({
      event: 'disconnect',
      id: this.nextEventId++,
      payload: {},
    })
  }

  async connect(
    _protocolVersion: number,
    request: ConnectRequest
  ): Promise<ConnectEvent> {
    const tonAddrRequest = request.items.find(
      (item: { name: string }) => item.name === 'ton_addr'
    )
    if (!tonAddrRequest) {
      return {
        event: 'connect_error',
        id: 0,
        payload: { code: 1, message: 'ton_addr item is required' },
      }
    }

    const tonProofItem = request.items.find(
      (item: { name: string }) => item.name === 'ton_proof'
    )
    const tonProofRequest =
      tonProofItem &&
      'payload' in tonProofItem &&
      typeof tonProofItem.payload === 'string'
        ? { payload: tonProofItem.payload }
        : undefined

    const manifestResult = await attempt(fetch(request.manifestUrl))
    if ('error' in manifestResult) {
      return {
        event: 'connect_error',
        id: 0,
        payload: { code: 2, message: 'App manifest not found' },
      }
    }

    const manifestResponse = manifestResult.data

    if (!manifestResponse.ok) {
      return {
        event: 'connect_error',
        id: 0,
        payload: { code: 2, message: 'App manifest not found' },
      }
    }

    const contentType = manifestResponse.headers.get('content-type')
    if (contentType && !contentType.includes('application/json')) {
      return {
        event: 'connect_error',
        id: 0,
        payload: { code: 2, message: 'App manifest not found' },
      }
    }

    const manifestJsonResult = await attempt(manifestResponse.json())
    if (
      'error' in manifestJsonResult ||
      !manifestJsonResult.data ||
      typeof manifestJsonResult.data !== 'object'
    ) {
      return {
        event: 'connect_error',
        id: 0,
        payload: { code: 2, message: 'App manifest not found' },
      }
    }

    const manifestData = manifestJsonResult.data as Record<string, unknown>
    const manifestUrl =
      'url' in manifestData && typeof manifestData.url === 'string'
        ? manifestData.url
        : undefined

    const { data, error } = await attempt(
      callPopup({ grantVaultAccess: { preselectFastVault: true } })
    )

    if (error === PopupError.RejectedByUser) {
      return {
        event: 'connect_error',
        id: 0,
        payload: { code: 300, message: 'User declined the connection' },
      }
    }

    if (!data?.appSession) {
      return {
        event: 'connect_error',
        id: 0,
        payload: { code: 0, message: 'Failed to connect' },
      }
    }

    const { data: account, error: getAccountError } = await attempt(
      callBackground({ getAccount: { chain: Chain.Ton } })
    )

    if (getAccountError || !account?.address || !account?.publicKey) {
      return {
        event: 'connect_error',
        id: 0,
        payload: { code: 0, message: 'Failed to get account' },
      }
    }

    const walletStateInit = getWalletStateInit(account.publicKey)
    const rawAddressResult = attempt(() =>
      Address.parse(account.address).toRawString()
    )
    if ('error' in rawAddressResult) {
      return {
        event: 'connect_error',
        id: 0,
        payload: { code: 0, message: 'Failed to get account' },
      }
    }
    const rawAddress = rawAddressResult.data

    const replyItems: ConnectItemReply[] = [
      {
        name: 'ton_addr',
        address: rawAddress,
        network: CHAIN.MAINNET,
        publicKey: account.publicKey,
        walletStateInit,
      },
    ]

    if (tonProofRequest) {
      const domainUrl = manifestUrl ?? request.manifestUrl
      const domainResult = attempt(() => new URL(domainUrl).hostname)
      if ('error' in domainResult) {
        return {
          event: 'connect_error',
          id: 0,
          payload: { code: 2, message: 'App manifest not found' },
        }
      }
      const domain = domainResult.data
      const timestamp = Math.floor(Date.now() / 1000)

      const proofMessage = buildTonProofPayload({
        address: account.address,
        domain,
        timestamp,
        payload: tonProofRequest.payload,
      })

      const proofHash = getTonProofHash(proofMessage)

      const { data: signatureHex, error: signError } = await attempt(
        callPopup({
          signMessage: {
            sign_message: {
              message: `0x${proofHash}`,
              chain: Chain.Ton,
            },
          },
        })
      )

      if (signError === PopupError.RejectedByUser) {
        return {
          event: 'connect_error',
          id: 0,
          payload: { code: 300, message: 'User declined the connection' },
        }
      }

      if (signError || !signatureHex) {
        return {
          event: 'connect_error',
          id: 0,
          payload: { code: 0, message: 'Failed to sign proof' },
        }
      }

      replyItems.push(
        formatTonProofReply({
          signatureHex: String(signatureHex),
          timestamp,
          domain,
          payload: tonProofRequest.payload,
        })
      )
    }

    return {
      event: 'connect',
      id: 0,
      payload: {
        items: replyItems,
        device: this.deviceInfo,
      },
    }
  }

  async restoreConnection(): Promise<ConnectEvent> {
    const { data, error } = await attempt(
      callBackground({ getAccount: { chain: Chain.Ton } })
    )

    if (error || !data?.address || !data?.publicKey) {
      return {
        event: 'connect_error',
        id: 0,
        payload: { code: 0, message: 'No existing session' },
      }
    }

    const walletStateInit = getWalletStateInit(data.publicKey)
    const rawAddressResult = attempt(() =>
      Address.parse(data.address).toRawString()
    )
    if ('error' in rawAddressResult) {
      return {
        event: 'connect_error',
        id: 0,
        payload: { code: 0, message: 'No existing session' },
      }
    }

    return {
      event: 'connect',
      id: 0,
      payload: {
        items: [
          {
            name: 'ton_addr',
            address: rawAddressResult.data,
            network: CHAIN.MAINNET,
            publicKey: data.publicKey,
            walletStateInit,
          },
        ],
        device: this.deviceInfo,
      },
    }
  }

  /** Handles the signData RPC method for signing arbitrary data per TonConnect v2 spec. */
  private async handleSignData(
    message: AppRequest<'signData'>
  ): Promise<WalletResponse<'signData'>> {
    const getBadRequestError = (
      errorMessage: string
    ): WalletResponse<'signData'> => ({
      id: message.id,
      error: {
        code: 1 as SIGN_DATA_ERROR_CODES,
        message: errorMessage,
      },
    })

    const decodedResult = attempt(
      () => JSON.parse(message.params[0]) as SignDataPayload
    )
    if ('error' in decodedResult) {
      return getBadRequestError('Invalid signData payload')
    }

    const payload = decodedResult.data
    if (!payload || typeof payload !== 'object' || !('type' in payload)) {
      return getBadRequestError('Invalid signData payload')
    }

    if (payload.network && payload.network !== CHAIN.MAINNET) {
      return getBadRequestError('Unsupported TON network')
    }

    const { data: account, error: getAccountError } = await attempt(
      callBackground({ getAccount: { chain: Chain.Ton } })
    )
    if (getAccountError || !account?.address) {
      return {
        id: message.id,
        error: {
          code: 100 as SIGN_DATA_ERROR_CODES,
          message: 'Failed to get account',
        },
      }
    }

    if (payload.from) {
      const fromRaw = attempt(() => Address.parse(payload.from!).toRawString())
      const accountRaw = attempt(() =>
        Address.parse(account.address).toRawString()
      )
      if (
        'error' in fromRaw ||
        'error' in accountRaw ||
        fromRaw.data !== accountRaw.data
      ) {
        return getBadRequestError(
          'Requested sender does not match active TON account'
        )
      }
    }

    const domain = window.location.hostname
    const timestamp = Math.floor(Date.now() / 1000)

    const hashResult = attempt((): string => {
      if (payload.type === 'text') {
        return buildSignDataTextBinaryHash({
          address: account.address,
          domain,
          timestamp,
          type: 'text',
          payloadData: Buffer.from(payload.text, 'utf-8'),
        })
      }
      if (payload.type === 'binary') {
        return buildSignDataTextBinaryHash({
          address: account.address,
          domain,
          timestamp,
          type: 'binary',
          payloadData: Buffer.from(payload.bytes, 'base64'),
        })
      }
      if (payload.type === 'cell') {
        return buildSignDataCellHash({
          address: account.address,
          domain,
          timestamp,
          schema: payload.schema,
          cellBase64: payload.cell,
        })
      }
      throw new Error('Unsupported signData payload type')
    })

    if ('error' in hashResult) {
      return getBadRequestError('Failed to build signData hash')
    }

    const hashHex = hashResult.data

    const { data: signatureHex, error: signError } = await attempt(
      callPopup(
        {
          signMessage: {
            sign_message: {
              message: `0x${hashHex}`,
              chain: Chain.Ton,
            },
          },
        },
        { account: account.address }
      )
    )

    if (signError === PopupError.RejectedByUser) {
      return {
        id: message.id,
        error: {
          code: 300 as SIGN_DATA_ERROR_CODES,
          message: 'User declined the signing request',
        },
      }
    }

    if (signError || !signatureHex) {
      return {
        id: message.id,
        error: {
          code: 100 as SIGN_DATA_ERROR_CODES,
          message: 'Failed to sign data',
        },
      }
    }

    const rawAddressResult = attempt(() =>
      Address.parse(account.address).toRawString()
    )
    if ('error' in rawAddressResult) {
      return {
        id: message.id,
        error: {
          code: 100 as SIGN_DATA_ERROR_CODES,
          message: 'Failed to format address',
        },
      }
    }

    return {
      id: message.id,
      result: {
        signature: Buffer.from(String(signatureHex), 'hex').toString('base64'),
        address: rawAddressResult.data,
        timestamp,
        domain,
        payload,
      },
    }
  }

  async send<T extends RpcMethod>(
    message: AppRequest<T>
  ): Promise<WalletResponse<T>> {
    if (message.method === 'signData') {
      return this.handleSignData(message) as unknown as WalletResponse<T>
    }

    if (message.method !== 'sendTransaction') {
      return {
        id: message.id,
        error: {
          code: 400 as SEND_TRANSACTION_ERROR_CODES,
          message: 'Method not supported',
        },
      } as WalletResponse<T>
    }

    const getBadRequestError = (errorMessage: string): WalletResponse<T> =>
      ({
        id: message.id,
        error: {
          code: 1 as SEND_TRANSACTION_ERROR_CODES,
          message: errorMessage,
        },
      }) as WalletResponse<T>

    const decodedBodyResult = attempt(
      () => JSON.parse(message.params[0]) as TonConnectSendTransactionPayload
    )
    if ('error' in decodedBodyResult) {
      return getBadRequestError('Invalid sendTransaction payload')
    }

    const payload = decodedBodyResult.data
    if (!payload || typeof payload !== 'object') {
      return getBadRequestError('Invalid sendTransaction payload')
    }

    const validUntil =
      payload.valid_until ?? (payload as { validUntil?: number }).validUntil

    if (
      typeof validUntil !== 'number' ||
      !Number.isFinite(validUntil) ||
      validUntil <= Math.floor(Date.now() / 1000)
    ) {
      return getBadRequestError('sendTransaction request expired')
    }

    if (payload.network && payload.network !== CHAIN.MAINNET) {
      return getBadRequestError('Unsupported TON network')
    }

    if (!Array.isArray(payload.messages) || payload.messages.length === 0) {
      return getBadRequestError('At least one transaction message is required')
    }
    const sendTransactionFeature = this.deviceInfo.features.find(
      feature =>
        typeof feature !== 'string' && feature.name === 'SendTransaction'
    )
    const maxMessages =
      sendTransactionFeature && 'maxMessages' in sendTransactionFeature
        ? sendTransactionFeature.maxMessages
        : 1
    if (payload.messages.length > maxMessages) {
      return getBadRequestError(
        `Only up to ${maxMessages} message(s) are supported`
      )
    }

    const tonMessages: Array<{ to: string; amount: string; payload?: string }> =
      []
    for (let i = 0; i < payload.messages.length; i++) {
      const msg = payload.messages[i]
      if (!msg || typeof msg.address !== 'string' || !msg.address) {
        return getBadRequestError(
          `Message ${i + 1}: recipient address is required`
        )
      }
      if (typeof msg.amount !== 'string' || !msg.amount) {
        return getBadRequestError(`Message ${i + 1}: amount is required`)
      }
      const msgAmountResult = attempt(() => BigInt(msg.amount))
      if ('error' in msgAmountResult || msgAmountResult.data <= 0n) {
        return getBadRequestError(
          `Message ${i + 1}: amount must be a positive integer`
        )
      }
      if (msg.stateInit) {
        return getBadRequestError(
          `Message ${i + 1}: stateInit is not supported`
        )
      }
      tonMessages.push({
        to: msg.address,
        amount: msgAmountResult.data.toString(),
        payload: msg.payload,
      })
    }

    const firstMessage = tonMessages[0]!
    const { data: account, error: getAccountError } = await attempt(
      callBackground({ getAccount: { chain: Chain.Ton } })
    )
    if (getAccountError || !account?.address) {
      return {
        id: message.id,
        error: {
          code: 100 as SEND_TRANSACTION_ERROR_CODES,
          message: 'Failed to get account',
        },
      } as WalletResponse<T>
    }
    if (
      payload.from &&
      payload.from.toLowerCase() !== account.address.toLowerCase()
    ) {
      return getBadRequestError(
        'Requested sender does not match active TON account'
      )
    }
    const transactionPayload: ITransactionPayload = {
      keysign: {
        chain: Chain.Ton,
        transactionDetails: {
          from: account.address,
          to: firstMessage.to,
          asset: {
            ticker: chainFeeCoin[Chain.Ton].ticker,
          },
          amount: {
            amount: firstMessage.amount,
            decimals: chainFeeCoin[Chain.Ton].decimals,
          },
          data: firstMessage.payload,
          tonMessages,
        },
      },
    }
    const { data: txs, error } = await attempt(
      callPopup(
        {
          sendTx: transactionPayload,
        },
        {
          account: account.address,
        }
      )
    )
    if (error === PopupError.RejectedByUser) {
      return {
        id: message.id,
        error: {
          code: 300 as SEND_TRANSACTION_ERROR_CODES,
          message: 'User declined the transaction',
        },
      } as WalletResponse<T>
    }
    if (error) {
      return {
        id: message.id,
        error: {
          code: 100 as SEND_TRANSACTION_ERROR_CODES,
          message: 'Failed to process transaction request',
        },
      } as WalletResponse<T>
    }

    const txHash = txs?.[0]?.hash
    if (!txHash) {
      return {
        id: message.id,
        error: {
          code: 100 as SEND_TRANSACTION_ERROR_CODES,
          message: 'No transaction hash returned',
        },
      } as WalletResponse<T>
    }
    return {
      id: message.id,
      result: txHash,
    } as WalletResponse<T>
  }
}
