import VULTI_ICON_RAW_SVG from '@clients/extension/src/inpage/icon'
import { Chain } from '@core/chain/Chain'
import { callBackground } from '@core/inpage-provider/background'
import { callPopup } from '@core/inpage-provider/popup'
import { PopupError } from '@core/inpage-provider/popup/error'
import { attempt } from '@lib/utils/attempt'
import type {
  ConnectEvent,
  ConnectRequest,
  DeviceInfo,
  WalletEvent,
} from '@tonconnect/protocol'
import { CHAIN } from '@tonconnect/protocol'

import { getWalletStateInit } from './getWalletStateInit'

type TonConnectCallback = (event: WalletEvent) => void

export class TonConnectBridge {
  deviceInfo: DeviceInfo = {
    platform: 'browser',
    appName: 'Vultisig',
    appVersion: '1.0.0',
    maxProtocolVersion: 2,
    features: [
      'SendTransaction',
      {
        name: 'SendTransaction',
        maxMessages: 1,
        extraCurrencySupported: false,
      },
    ],
  }

  walletInfo = {
    name: 'Vultisig',
    image: VULTI_ICON_RAW_SVG,
    about_url: 'https://vultisig.com',
  }

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

  disconnect(): void {
    callBackground({ signOut: {} })
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

    const tonProofRequest = request.items.find(
      (item: { name: string }) => item.name === 'ton_proof'
    )
    if (tonProofRequest) {
      return {
        event: 'connect_error',
        id: 0,
        payload: { code: 400, message: 'ton_proof not supported' },
      }
    }

    try {
      await fetch(request.manifestUrl)
    } catch {
      return {
        event: 'connect_error',
        id: 0,
        payload: { code: 2, message: 'App manifest not found' },
      }
    }

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

    const account = await callBackground({
      getAccount: { chain: Chain.Ton },
    })

    if (!account.address || !account.publicKey) {
      return {
        event: 'connect_error',
        id: 0,
        payload: { code: 0, message: 'Failed to get account' },
      }
    }

    const walletStateInit = getWalletStateInit(account.publicKey)

    return {
      event: 'connect',
      id: 0,
      payload: {
        items: [
          {
            name: 'ton_addr',
            address: account.address,
            network: CHAIN.MAINNET,
            publicKey: account.publicKey,
            walletStateInit,
          },
        ],
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

    return {
      event: 'connect',
      id: 0,
      payload: {
        items: [
          {
            name: 'ton_addr',
            address: data.address,
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
