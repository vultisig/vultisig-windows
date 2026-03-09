import { initializeFromt } from '@core/mpc/fromt/initialize'

import {
  fromt_derive_address,
  fromt_derive_view_key,
  fromt_keyshare_birthday,
  fromt_keyshare_network,
} from '../../../../lib/fromt/fromt_wasm'
import { getMoneroDaemonUrl } from './daemonRpc'
import { getMoneroScanStorage } from './moneroScanStorage'

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

const networkName = (network: number): 'mainnet' | 'stagenet' | 'testnet' => {
  if (network === 1) return 'stagenet'
  if (network === 2) return 'testnet'
  return 'mainnet'
}

const loadMoneroTs = (): Promise<any> =>
  new Promise((resolve, reject) => {
    const existing = (window as any).__moneroTsBundle
    if (existing) {
      resolve(existing.default || existing)
      return
    }

    const script = document.createElement('script')
    script.src = '/libs/monero-ts/index.js'
    script.onload = () => {
      const mod = (window as any).__moneroTsBundle
      if (!mod) {
        reject(new Error('monero-ts loaded but __moneroTsBundle is empty'))
        return
      }
      resolve(mod.default || mod)
    }
    script.onerror = () => reject(new Error('Failed to load monero-ts script'))
    document.head.appendChild(script)
  })

export const getSpendableBalance = async (address: string): Promise<bigint> => {
  const data = await getMoneroScanStorage().load(address)
  if (!data) return BigInt(0)
  return BigInt(data.balance)
}

type ScanParams = {
  keyShareBase64: string
  publicKeyEcdsa: string
  onProgress?: (current: number, total: number) => void
}

export const scanMoneroBlocks = async ({
  keyShareBase64,
  publicKeyEcdsa,
  onProgress,
}: ScanParams): Promise<void> => {
  console.log('[monero-scanner] Starting scan...')
  await initializeFromt()

  const keyShare = new Uint8Array(Buffer.from(keyShareBase64, 'base64'))
  const address = fromt_derive_address(keyShare)
  const birthday = Number(fromt_keyshare_birthday(keyShare))
  const viewKey = fromt_derive_view_key(keyShare)
  const network = fromt_keyshare_network(keyShare)

  const storage = getMoneroScanStorage()
  let scanData = await storage.load(address)

  if (!scanData) {
    scanData = {
      address,
      publicKeyEcdsa,
      scanHeight: null,
      scanTarget: null,
      birthHeight: birthday > 0 ? birthday : null,
      birthdayScanDone: false,
      balance: '0',
    }
    await storage.save(scanData)
  } else if (scanData.birthHeight === null && birthday > 0) {
    scanData.birthHeight = birthday
    await storage.save(scanData)
  }

  const daemonUrl = getMoneroDaemonUrl()
  const privateViewKey = toHex(viewKey)
  const restoreHeight = birthday > 0 ? birthday : 0

  console.log('[monero-scanner] address:', address)
  console.log('[monero-scanner] viewKey:', privateViewKey)
  console.log('[monero-scanner] restoreHeight:', restoreHeight)
  console.log('[monero-scanner] network:', network)
  console.log('[monero-scanner] daemon:', daemonUrl)

  console.log('[monero-scanner] Loading monero-ts via script tag...')
  let moneroTs: any
  try {
    moneroTs = await loadMoneroTs()
    console.log(
      '[monero-scanner] monero-ts loaded, exports:',
      Object.keys(moneroTs).length,
      Object.keys(moneroTs).slice(0, 10)
    )
  } catch (err) {
    console.error('[monero-scanner] Failed to load monero-ts:', err)
    scanData.balance = '0'
    await storage.save(scanData)
    onProgress?.(1, 1)
    return
  }

  console.log(
    '[monero-scanner] LibraryUtils:',
    typeof moneroTs.LibraryUtils,
    'createWalletFull:',
    typeof moneroTs.createWalletFull
  )
  moneroTs.LibraryUtils.setWorkerDistPath('/libs/monero-ts/monero.worker.js')

  const netType =
    networkName(network) === 'stagenet'
      ? moneroTs.MoneroNetworkType.STAGENET
      : networkName(network) === 'testnet'
        ? moneroTs.MoneroNetworkType.TESTNET
        : moneroTs.MoneroNetworkType.MAINNET

  console.log('[monero-scanner] Creating wallet...')
  let wallet: any
  try {
    wallet = await moneroTs.createWalletFull({
      networkType: netType,
      primaryAddress: address,
      privateViewKey,
      restoreHeight,
      server: { uri: daemonUrl },
    })
    console.log('[monero-scanner] Wallet created successfully')
  } catch (err: any) {
    console.error(
      '[monero-scanner] createWalletFull failed:',
      err?.message || err
    )
    scanData.balance = '0'
    await storage.save(scanData)
    onProgress?.(1, 1)
    return
  }

  const listener = new moneroTs.MoneroWalletListener()
  listener.onSyncProgress = async (
    height: number,
    _startHeight: number,
    endHeight: number
  ) => {
    scanData!.scanHeight = height
    scanData!.scanTarget = endHeight
    await storage.save(scanData!)
    onProgress?.(height, endHeight)
  }

  console.log('[monero-scanner] Starting sync...')
  try {
    await wallet.sync(listener)
    console.log('[monero-scanner] Sync complete')
  } catch (err: any) {
    console.error('[monero-scanner] sync failed:', err?.message || err)
  }

  const balance = await wallet.getBalance()
  const chainHeight = await wallet.getHeight()

  scanData.balance = BigInt(balance.toString()).toString()
  scanData.scanHeight = chainHeight
  scanData.scanTarget = chainHeight
  await storage.save(scanData)

  console.log('[monero-scanner] Balance:', balance.toString())

  await wallet.close()
  onProgress?.(chainHeight, chainHeight)
  console.log('[monero-scanner] Done')
}
