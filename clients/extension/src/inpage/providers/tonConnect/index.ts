import { callBackground } from '@core/inpage-provider/background'
import { callPopup } from '@core/inpage-provider/popup'
import { PopupError } from '@core/inpage-provider/popup/error'
import { Address } from '@ton/core'
import type {
  ConnectEvent,
  ConnectItemReply,
  ConnectRequest,
  DeviceInfo,
  WalletEvent,
} from '@tonconnect/protocol'
import { CHAIN } from '@tonconnect/protocol'
import { Chain } from '@vultisig/core-chain/Chain'
import { attempt } from '@vultisig/lib-utils/attempt'

import { getWalletStateInit } from './getWalletStateInit'
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
}
