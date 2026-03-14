import { initializeFromt } from '@core/mpc/fromt/initialize'
import { hexToBytes } from '@lib/utils/hexToBytes'
import { toHex } from '@lib/utils/toHex'

import {
  fromt_derive_address,
  fromt_derive_spend_pub_key,
  fromt_derive_view_key,
  fromt_filter_spent_outputs,
  fromt_keyshare_birthday,
  fromt_keyshare_network,
  fromt_outputs_for_key_image,
} from '../../../../lib/fromt/fromt_wasm'
import { getMoneroChainTip } from './chainTip'
import {
  getMoneroDaemonUrls,
  getTransactionsByHashes,
  isKeyImageSpent,
  MoneroDaemonTxMetadata,
} from './daemonRpc'
import {
  getMoneroScanStorage,
  MoneroScanData,
  MoneroStoredOutput,
} from './moneroScanStorage'
import {
  deriveScannedMoneroOutput,
  deriveStoredMoneroOutput,
} from './outputDerivation'
import { isSpendableStoredMoneroOutput } from './spending'
import { networkName } from './walletHelpers'

const cloneMoneroScanData = (data: MoneroScanData): MoneroScanData => ({
  ...data,
  outputs: data.outputs?.map(output => ({ ...output })),
})

const decodeMoneroFilterSpentOutputs = (
  result: Uint32Array
): { balance: bigint; unspentOutputs: number } => {
  if (result.length < 3) {
    throw new Error('Invalid fromt_filter_spent_outputs result')
  }

  const balance = BigInt(result[0]) + (BigInt(result[1]) << BigInt(32))
  return {
    balance,
    unspentOutputs: Number(result[2]),
  }
}

const summarizeMoneroOutputsData = (
  outputsData: Uint8Array,
  spentFlags: boolean[]
): { balance: bigint; unspentOutputs: number } => {
  if (outputsData.length < 4) {
    throw new Error('Invalid Monero outputs data')
  }

  const view = new DataView(
    outputsData.buffer,
    outputsData.byteOffset,
    outputsData.byteLength
  )
  const count = view.getUint32(0, true)
  const expectedLength = 4 + count * 72
  if (outputsData.length < expectedLength) {
    throw new Error(
      `Expected at least ${expectedLength} bytes of Monero outputs data, got ${outputsData.length}`
    )
  }

  let balance = BigInt(0)
  let unspentOutputs = 0

  for (let index = 0; index < count; index++) {
    if (spentFlags[index]) {
      continue
    }

    const offset = 4 + index * 72 + 64
    const low = view.getUint32(offset, true)
    const high = view.getUint32(offset + 4, true)
    balance += BigInt(low) + (BigInt(high) << BigInt(32))
    unspentOutputs += 1
  }

  return {
    balance,
    unspentOutputs,
  }
}

const getMoneroFilterSpentOutputsSummary = async (
  outputsData: Uint8Array,
  spentFlags: boolean[]
): Promise<{ balance: bigint; unspentOutputs: number }> => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return summarizeMoneroOutputsData(outputsData, spentFlags)
  }

  try {
    await initializeFromt()

    return decodeMoneroFilterSpentOutputs(
      fromt_filter_spent_outputs(
        outputsData,
        encodeMoneroSpentFlags(spentFlags)
      )
    )
  } catch {
    return summarizeMoneroOutputsData(outputsData, spentFlags)
  }
}

const encodeMoneroSpentFlags = (spentFlags: boolean[]): Uint8Array =>
  Uint8Array.from(spentFlags.map(flag => (flag ? 1 : 0)))

const getMoneroKeyImageHexes = (
  keyImages: Uint8Array,
  count: number
): string[] => {
  const expectedLength = count * 32
  if (keyImages.length < expectedLength) {
    throw new Error(
      `Expected ${expectedLength} key image bytes, got ${keyImages.length}`
    )
  }

  return Array.from({ length: count }, (_, index) =>
    toHex(keyImages.slice(index * 32, (index + 1) * 32))
  )
}

type MoneroOutputSummary = {
  totalOutputs: number
  spentOutputs: number
  frozenOutputs: number
  lockedOutputs: number
  unspentOutputs: number
  spendableOutputs: number
  spendableBalance: bigint
}

const summarizeOutputs = (
  outputs: MoneroStoredOutput[],
  chainHeight: number | null = null
): MoneroOutputSummary => {
  let spentOutputs = 0
  let frozenOutputs = 0
  let lockedOutputs = 0
  let unspentOutputs = 0
  let spendableOutputs = 0
  let spendableBalance = BigInt(0)

  for (const output of outputs) {
    if (output.spent) {
      spentOutputs += 1
      continue
    }

    unspentOutputs += 1

    if (output.frozen) frozenOutputs += 1
    if (output.locked) lockedOutputs += 1

    if (isSpendableStoredMoneroOutput(output, chainHeight)) {
      spendableOutputs += 1
      spendableBalance += BigInt(output.amount)
    }
  }

  return {
    totalOutputs: outputs.length,
    spentOutputs,
    frozenOutputs,
    lockedOutputs,
    unspentOutputs,
    spendableOutputs,
    spendableBalance,
  }
}

export const getPendingMoneroKeyImageOutputs = (
  outputs: MoneroStoredOutput[]
): MoneroStoredOutput[] =>
  outputs.filter(output => !output.spent && !output.keyImageHex)

const getSpendDetectionMode = (
  outputs: MoneroStoredOutput[] = []
): MoneroScanData['spendDetectionMode'] =>
  getPendingMoneroKeyImageOutputs(outputs).length > 0
    ? 'key-image-pending'
    : 'key-image+local'

export const encodeMoneroOutputsWithAmounts = (
  outputs: Pick<
    MoneroStoredOutput,
    'amount' | 'keyOffsetHex' | 'outputKeyHex'
  >[]
): Uint8Array => {
  const count = outputs.length
  const buffer = new Uint8Array(4 + count * 72)
  const view = new DataView(buffer.buffer)
  view.setUint32(0, count, true)

  for (let index = 0; index < count; index++) {
    const output = outputs[index]
    const offset = 4 + index * 72
    buffer.set(hexToBytes(output.outputKeyHex).slice(0, 32), offset)
    buffer.set(hexToBytes(output.keyOffsetHex).slice(0, 32), offset + 32)

    const amount = BigInt(output.amount)
    view.setUint32(offset + 64, Number(amount & BigInt(0xffffffff)), true)
    view.setUint32(
      offset + 68,
      Number((amount >> BigInt(32)) & BigInt(0xffffffff)),
      true
    )
  }

  return buffer
}

export const getMoneroOutputsForKeyImage = (
  outputsData: Uint8Array
): Uint8Array => fromt_outputs_for_key_image(outputsData)

const getMoneroOutputKeyHex = (output: any): string | null => {
  const outputKeyHex = output.getStealthPublicKey?.()
  return typeof outputKeyHex === 'string' && outputKeyHex.length > 0
    ? outputKeyHex.toLowerCase()
    : null
}

const getMoneroTxHash = (tx: any): string | null => {
  const hash = tx?.getHash?.()
  return typeof hash === 'string' && hash.length > 0 ? hash.toLowerCase() : null
}

const getMoneroTxOutputs = (tx: any): any[] => {
  const txOutputs = tx?.getOutputs?.()
  return Array.isArray(txOutputs) ? txOutputs : []
}

const getMoneroTxExtraBytes = (tx: any): Uint8Array | null => {
  const extra = tx?.getExtra?.()
  if (extra instanceof Uint8Array && extra.length > 0) {
    return extra
  }
  if (Array.isArray(extra) && extra.length > 0) {
    return new Uint8Array(extra)
  }

  const extraHex = tx?.getExtraHex?.()
  if (typeof extraHex === 'string' && extraHex.length > 0) {
    return hexToBytes(extraHex)
  }

  return null
}

const hasHydratedMoneroTxMetadata = (tx: any): boolean =>
  getMoneroTxExtraBytes(tx) !== null && getMoneroTxOutputs(tx).length > 0

const createTxFromDaemonMetadata = (tx: MoneroDaemonTxMetadata) => ({
  getHash: () => tx.hash,
  getHeight: () => tx.height ?? undefined,
  getExtra: () => tx.extra ?? undefined,
  getOutputs: () =>
    tx.outputs.map(output => ({
      getStealthPublicKey: () => output.stealthPublicKeyHex,
      getIndex: () => output.globalIndex,
    })),
  getRctSignatures: () => tx.rctSignatures,
})

type BuildStoredOutputsFromWalletDataResult = {
  outputs: MoneroStoredOutput[]
  txCount: number
  hydratedTxCount: number
  reusedStoredOutputs: number
  unresolvedOutputCount: number
  unresolvedNewOutputCount: number
  incompleteMetadataCount: number
}

export const buildStoredOutputsFromWalletData = ({
  walletOutputs,
  walletTxs,
  existingOutputs,
  privateViewKeyHex,
  publicSpendKeyHex,
}: {
  walletOutputs: any[]
  walletTxs: any[]
  existingOutputs: MoneroStoredOutput[]
  privateViewKeyHex: string
  publicSpendKeyHex: string
}): BuildStoredOutputsFromWalletDataResult => {
  const txByHash = new Map<string, any>()
  const txByOutputKey = new Map<string, any>()

  for (const tx of walletTxs) {
    if (!hasHydratedMoneroTxMetadata(tx)) continue

    const txHash = getMoneroTxHash(tx)
    if (txHash) {
      txByHash.set(txHash, tx)
    }

    for (const txOutput of getMoneroTxOutputs(tx)) {
      const outputKeyHex = getMoneroOutputKeyHex(txOutput)
      if (outputKeyHex) {
        txByOutputKey.set(outputKeyHex, tx)
      }
    }
  }

  const existingOutputsByKey = new Map<string, MoneroStoredOutput>(
    existingOutputs.map(output => [output.outputKeyHex.toLowerCase(), output])
  )

  const outputs: MoneroStoredOutput[] = []
  let reusedStoredOutputs = 0
  let unresolvedOutputCount = 0
  let unresolvedNewOutputCount = 0

  for (const output of walletOutputs) {
    const outputKeyHex = getMoneroOutputKeyHex(output)
    const frozen = output.getIsFrozen?.() === true
    const locked = output.getIsLocked?.() === true
    const existingOutput = outputKeyHex
      ? existingOutputsByKey.get(outputKeyHex)
      : undefined

    const reuseStoredOutput = () => {
      if (!existingOutput) return false

      outputs.push({
        ...existingOutput,
        spent: existingOutput.spent,
        frozen,
        locked,
      })
      reusedStoredOutputs += 1
      return true
    }

    const outputTx = output.getTx?.()
    const outputTxHash = getMoneroTxHash(outputTx)
    const resolvedTx =
      (hasHydratedMoneroTxMetadata(outputTx) && outputTx) ||
      (outputTxHash ? txByHash.get(outputTxHash) : undefined) ||
      (outputKeyHex ? txByOutputKey.get(outputKeyHex) : undefined)

    const txExtra = getMoneroTxExtraBytes(resolvedTx)
    const txOutputs = getMoneroTxOutputs(resolvedTx)
    const outputHeight =
      typeof resolvedTx?.getHeight?.() === 'number'
        ? resolvedTx.getHeight()
        : (existingOutput?.height ?? null)

    try {
      if (!outputKeyHex) {
        throw new Error('Wallet output missing stealth public key')
      }
      if (!resolvedTx || !txExtra || txOutputs.length === 0) {
        throw new Error('Wallet output missing parent tx metadata')
      }

      const amount = output.getAmount?.()
      const globalIndex = output.getIndex?.()
      if (amount == null) {
        throw new Error('Wallet output missing amount')
      }

      const txOutputSummaries = txOutputs.map((txOutput: any) => ({
        stealthPublicKeyHex: txOutput.getStealthPublicKey(),
        globalIndex:
          txOutput.getIndex?.() == null
            ? undefined
            : BigInt(txOutput.getIndex().toString()),
      }))
      const amountBigInt = BigInt(amount.toString())
      const globalIndexBigInt =
        globalIndex == null ? undefined : BigInt(globalIndex.toString())

      let storedOutput: MoneroStoredOutput
      try {
        if (globalIndexBigInt == null) {
          throw new Error('Wallet output missing global index')
        }

        const rctSigs = resolvedTx.getRctSignatures?.()
        storedOutput = deriveStoredMoneroOutput({
          amount: amountBigInt,
          globalIndex: globalIndexBigInt,
          outputKeyHex,
          txExtra,
          txOutputs: txOutputSummaries,
          rctType: Number(rctSigs?.type),
          ecdhInfo: rctSigs?.ecdhInfo,
          privateViewKeyHex,
          publicSpendKeyHex,
        })
      } catch {
        storedOutput = deriveScannedMoneroOutput({
          amount: amountBigInt,
          globalIndex: globalIndexBigInt,
          outputKeyHex,
          txExtra,
          txOutputs: txOutputSummaries,
          privateViewKeyHex,
          publicSpendKeyHex,
        })
      }

      outputs.push({
        ...storedOutput,
        height: outputHeight ?? undefined,
        keyImageHex: existingOutput?.keyImageHex,
        spent: existingOutput?.spent ?? false,
        frozen,
        locked,
      })
    } catch {
      if (reuseStoredOutput()) continue
      unresolvedOutputCount += 1
      unresolvedNewOutputCount += 1
    }
  }

  const incompleteMetadataCount = outputs.filter(
    o => !o.commitmentMaskHex || !o.globalIndex
  ).length

  return {
    outputs,
    txCount: walletTxs.length,
    hydratedTxCount: txByHash.size,
    reusedStoredOutputs,
    unresolvedOutputCount,
    unresolvedNewOutputCount,
    incompleteMetadataCount,
  }
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

const activeSyncs = new Map<string, Promise<MoneroScanData>>()
const syncEpochs = new Map<string, number>()

const getSyncEpoch = (publicKeyEcdsa: string): number =>
  syncEpochs.get(publicKeyEcdsa) ?? 0

const isCurrentSyncEpoch = (
  publicKeyEcdsa: string,
  syncEpoch: number
): boolean => getSyncEpoch(publicKeyEcdsa) === syncEpoch

export const getSpendableBalance = async (
  publicKeyEcdsa: string
): Promise<bigint> => {
  const data = await getMoneroScanStorage().load(publicKeyEcdsa)
  if (!data) return BigInt(0)
  return summarizeOutputs(data.outputs ?? [], data.scanHeight).spendableBalance
}

export const markMoneroOutputsSpent = async ({
  publicKeyEcdsa,
  spentOutputKeys,
}: {
  publicKeyEcdsa: string
  spentOutputKeys: string[]
}): Promise<void> => {
  if (spentOutputKeys.length === 0) return

  const storage = getMoneroScanStorage()
  const scanData = await storage.load(publicKeyEcdsa)
  if (!scanData?.outputs) return

  const spentKeys = new Set(spentOutputKeys.map(key => key.toLowerCase()))
  const nextOutputs = scanData.outputs.map(output =>
    spentKeys.has(output.outputKeyHex.toLowerCase())
      ? { ...output, spent: true }
      : output
  )
  const summary = summarizeOutputs(nextOutputs, scanData.scanHeight)

  await storage.save({
    ...scanData,
    outputs: nextOutputs,
    balance: summary.spendableBalance.toString(),
    totalOutputs: summary.totalOutputs,
    spentOutputs: summary.spentOutputs,
    spendDetectionMode: getSpendDetectionMode(nextOutputs),
  })
}

export const finaliseMoneroOutputsWithKeyImages = async ({
  publicKeyEcdsa,
  outputs,
  outputsData,
  keyImages,
}: {
  publicKeyEcdsa: string
  outputs: Pick<MoneroStoredOutput, 'amount' | 'outputKeyHex'>[]
  outputsData: Uint8Array
  keyImages: Uint8Array
}): Promise<{
  checkedOutputs: number
  spentOutputs: number
  unspentOutputs: number
  balance: string
}> => {
  const checkedOutputs = outputs.length
  const keyImageHexes = getMoneroKeyImageHexes(keyImages, checkedOutputs)

  const spentFlags = await isKeyImageSpent(keyImageHexes)
  const spentOutputs = spentFlags.filter(Boolean).length

  const filterResult = await getMoneroFilterSpentOutputsSummary(
    outputsData,
    spentFlags
  )

  const storage = getMoneroScanStorage()
  const scanData = await storage.load(publicKeyEcdsa)
  if (!scanData?.outputs) {
    return {
      checkedOutputs,
      spentOutputs,
      unspentOutputs: filterResult.unspentOutputs,
      balance: filterResult.balance.toString(),
    }
  }

  const outputUpdates = new Map(
    outputs.map((output, index) => [
      output.outputKeyHex.toLowerCase(),
      {
        keyImageHex: keyImageHexes[index],
        spent: spentFlags[index],
      },
    ])
  )

  const nextOutputs = scanData.outputs.map(output => {
    const update = outputUpdates.get(output.outputKeyHex.toLowerCase())
    if (!update) return output

    return {
      ...output,
      keyImageHex: update.keyImageHex,
      spent: output.spent || update.spent,
    }
  })
  const summary = summarizeOutputs(nextOutputs, scanData.scanHeight)

  await storage.save({
    ...scanData,
    outputs: nextOutputs,
    balance: summary.spendableBalance.toString(),
    totalOutputs: summary.totalOutputs,
    spentOutputs: summary.spentOutputs,
    spendDetectionMode: getSpendDetectionMode(nextOutputs),
  })

  return {
    checkedOutputs,
    spentOutputs,
    unspentOutputs: filterResult.unspentOutputs,
    balance: summary.spendableBalance.toString(),
  }
}

type ScanParams = {
  keyShareBase64: string
  publicKeyEcdsa: string
  onProgress?: (current: number, total: number) => void
  syncEpoch?: number
}

type EnsureSyncParams = ScanParams & {
  force?: boolean
}

const shouldSyncScanData = (
  scanData: MoneroScanData | null,
  scanTargetHeight: number | null,
  force?: boolean
): boolean => {
  if (force) return true
  if (!scanData) return true
  if (!scanData.birthdayScanDone) return true
  if (!scanData.outputs) return true
  if (scanData.scanHeight == null) return true
  if (scanTargetHeight == null) return false
  return scanData.scanHeight < scanTargetHeight
}

export const ensureMoneroScanDataSynced = async ({
  keyShareBase64,
  publicKeyEcdsa,
  onProgress,
  force = false,
}: EnsureSyncParams): Promise<MoneroScanData> => {
  if (force) {
    syncEpochs.set(publicKeyEcdsa, getSyncEpoch(publicKeyEcdsa) + 1)
  }

  const active = activeSyncs.get(publicKeyEcdsa)
  if (active && !force) return active
  const syncEpoch = getSyncEpoch(publicKeyEcdsa)

  const promise = (async () => {
    const storage = getMoneroScanStorage()
    const existing = await storage.load(publicKeyEcdsa)

    let chainTip: number | null = null
    try {
      chainTip = await getMoneroChainTip()
    } catch (error) {
      console.warn('Monero chain tip fetch failed:', error)
    }

    const scanTargetHeight = chainTip

    if (shouldSyncScanData(existing, scanTargetHeight, force)) {
      await scanMoneroBlocks({
        keyShareBase64,
        publicKeyEcdsa,
        onProgress,
        syncEpoch,
      })
    }

    const synced = await storage.load(publicKeyEcdsa)
    if (!synced) {
      throw new Error('Monero scan data missing after sync')
    }
    return synced
  })().finally(() => {
    activeSyncs.delete(publicKeyEcdsa)
  })

  activeSyncs.set(publicKeyEcdsa, promise)
  return promise
}

export const scanMoneroBlocks = async ({
  keyShareBase64,
  publicKeyEcdsa,
  onProgress,
  syncEpoch = getSyncEpoch(publicKeyEcdsa),
}: ScanParams): Promise<void> => {
  await initializeFromt()

  const keyShare = new Uint8Array(Buffer.from(keyShareBase64, 'base64'))
  const address = fromt_derive_address(keyShare)
  const birthday = Number(fromt_keyshare_birthday(keyShare))
  const viewKey = fromt_derive_view_key(keyShare)
  const spendPubKey = fromt_derive_spend_pub_key(keyShare)
  const network = fromt_keyshare_network(keyShare)

  const storage = getMoneroScanStorage()
  let saveQueue = Promise.resolve()
  const queueSave = async (
    data: MoneroScanData,
    awaitCompletion = false
  ): Promise<void> => {
    const snapshot = cloneMoneroScanData(data)
    const task = async () => {
      if (!isCurrentSyncEpoch(publicKeyEcdsa, syncEpoch)) return
      await storage.save(snapshot)
    }
    const pending = saveQueue.then(task, task)
    saveQueue = pending.catch(() => {})
    if (awaitCompletion) {
      await pending
    } else {
      pending.catch(() => {})
    }
  }
  let scanData = await storage.load(publicKeyEcdsa)

  if (!scanData) {
    scanData = {
      address,
      publicKeyEcdsa,
      scanHeight: null,
      scanTarget: null,
      birthHeight: birthday > 0 ? birthday : null,
      birthdayScanDone: false,
      balance: '0',
      totalOutputs: 0,
      spentOutputs: 0,
      spendDetectionMode: getSpendDetectionMode([]),
      outputs: [],
    }
    await queueSave(scanData, true)
  } else {
    scanData.address = address
    if (scanData.birthHeight === null && birthday > 0) {
      scanData.birthHeight = birthday
    }
    await queueSave(scanData, true)
  }

  const privateViewKey = toHex(viewKey)
  const publicSpendKey = toHex(spendPubKey)
  const birthHeight = scanData.birthHeight ?? (birthday > 0 ? birthday : null)
  let moneroTs: any
  try {
    moneroTs = await loadMoneroTs()
  } catch (err) {
    console.error('Failed to load monero-ts:', err)
    onProgress?.(1, 1)
    return
  }

  moneroTs.LibraryUtils.setWorkerDistPath('/libs/monero-ts/monero.worker.js')

  const netType =
    networkName(network) === 'stagenet'
      ? moneroTs.MoneroNetworkType.STAGENET
      : networkName(network) === 'testnet'
        ? moneroTs.MoneroNetworkType.TESTNET
        : moneroTs.MoneroNetworkType.MAINNET

  const minHeight = birthHeight ?? 0
  const daemonUrls = getMoneroDaemonUrls()
  let lastError: unknown = null

  for (const daemonUrl of daemonUrls) {
    scanData = (await storage.load(publicKeyEcdsa)) ?? scanData
    const attemptRestoreHeight = scanData.scanHeight ?? birthHeight ?? 0
    const attemptHasWalletState = Boolean(
      scanData.walletKeysData && scanData.walletCacheData
    )

    let wallet: any
    let lastSavedHeight = 0
    const saveInterval = 1000
    let latestHeight = attemptRestoreHeight
    let latestTarget = scanData.scanTarget ?? attemptRestoreHeight
    const listener = new moneroTs.MoneroWalletListener()
    listener.onSyncProgress = (
      height: number,
      _startHeight: number,
      endHeight: number
    ) => {
      if (!isCurrentSyncEpoch(publicKeyEcdsa, syncEpoch)) return

      const currentHeight = Math.max(minHeight, height)
      const currentTarget = Math.max(minHeight, endHeight)
      latestHeight = Math.max(latestHeight, currentHeight)
      latestTarget = Math.max(latestTarget, currentTarget)
      scanData!.scanHeight = currentHeight
      scanData!.scanTarget = currentTarget
      onProgress?.(currentHeight, currentTarget)
      if (height - lastSavedHeight >= saveInterval) {
        lastSavedHeight = height
        void queueSave(scanData!)
      }
    }

    try {
      try {
        if (attemptHasWalletState) {
          const keysData = new Uint8Array(
            Buffer.from(scanData.walletKeysData!, 'base64')
          )
          const cacheData = new Uint8Array(
            Buffer.from(scanData.walletCacheData!, 'base64')
          )
          wallet = await moneroTs.openWalletFull({
            password: '',
            networkType: netType,
            keysData,
            cacheData,
            server: { uri: daemonUrl },
          })
        } else {
          wallet = await moneroTs.createWalletFull({
            networkType: netType,
            primaryAddress: address,
            privateViewKey,
            restoreHeight: attemptRestoreHeight,
            server: { uri: daemonUrl },
          })
        }
      } catch (err: any) {
        console.error('Monero wallet init failed:', err?.message || err)
        if (!attemptHasWalletState) {
          throw err
        }

        scanData.walletKeysData = undefined
        scanData.walletCacheData = undefined
        await queueSave(scanData, true)
        wallet = await moneroTs.createWalletFull({
          networkType: netType,
          primaryAddress: address,
          privateViewKey,
          restoreHeight: attemptRestoreHeight,
          server: { uri: daemonUrl },
        })
      }

      await wallet.sync(listener)

      const chainHeight = await wallet.getHeight()
      const chainScanHeight = Math.max(minHeight, chainHeight)
      const walletOutputs = await wallet.getOutputs()
      const walletTxs = await wallet.getTxs({
        minHeight,
        includeOutputs: true,
      })
      const freshData = await storage.load(publicKeyEcdsa)
      const dataToSave = freshData ?? scanData
      let combinedWalletTxs = [...walletTxs]
      let storedOutputsResult = buildStoredOutputsFromWalletData({
        walletOutputs,
        walletTxs: combinedWalletTxs,
        existingOutputs: dataToSave.outputs ?? [],
        privateViewKeyHex: privateViewKey,
        publicSpendKeyHex: publicSpendKey,
      })

      const needsDaemonFallback =
        storedOutputsResult.unresolvedNewOutputCount > 0 ||
        storedOutputsResult.incompleteMetadataCount > 0
      if (needsDaemonFallback) {
        const fallbackTxHashes = Array.from<string>(
          new Set(
            walletOutputs
              .map((output: any) => getMoneroTxHash(output.getTx?.()))
              .filter((hash: string | null): hash is string => Boolean(hash))
          )
        )
        const daemonFallbackTxs =
          fallbackTxHashes.length > 0
            ? await getTransactionsByHashes(fallbackTxHashes, daemonUrl)
            : []
        if (daemonFallbackTxs.length > 0) {
          const daemonTxByHash = new Map(
            daemonFallbackTxs.map(tx => [
              tx.hash,
              createTxFromDaemonMetadata(tx),
            ])
          )

          combinedWalletTxs = walletTxs.map((tx: any) => {
            const txHash = getMoneroTxHash(tx)
            return (txHash && daemonTxByHash.get(txHash)) || tx
          })

          for (const [hash, tx] of daemonTxByHash.entries()) {
            if (
              !combinedWalletTxs.some(
                (existingTx: any) => getMoneroTxHash(existingTx) === hash
              )
            ) {
              combinedWalletTxs.push(tx)
            }
          }

          storedOutputsResult = buildStoredOutputsFromWalletData({
            walletOutputs,
            walletTxs: combinedWalletTxs,
            existingOutputs: dataToSave.outputs ?? [],
            privateViewKeyHex: privateViewKey,
            publicSpendKeyHex: publicSpendKey,
          })
        }
      }

      const finalHeight = chainScanHeight
      const knownSpentKeys = new Set(
        (dataToSave.outputs ?? [])
          .filter((output: MoneroStoredOutput) => output.spent)
          .map((output: MoneroStoredOutput) =>
            output.outputKeyHex.toLowerCase()
          )
      )
      const nextOutputsByKey = new Map<string, MoneroStoredOutput>(
        storedOutputsResult.outputs.map((output: MoneroStoredOutput) => {
          const nextOutput = knownSpentKeys.has(
            output.outputKeyHex.toLowerCase()
          )
            ? { ...output, spent: true }
            : output

          return [nextOutput.outputKeyHex.toLowerCase(), nextOutput] as const
        })
      )
      for (const output of dataToSave.outputs ?? []) {
        const key = output.outputKeyHex.toLowerCase()
        if (!nextOutputsByKey.has(key)) {
          nextOutputsByKey.set(key, output)
        }
      }
      const nextOutputs = [...nextOutputsByKey.values()] as MoneroStoredOutput[]
      const summary = summarizeOutputs(nextOutputs, finalHeight)

      dataToSave.address = address
      dataToSave.balance = summary.spendableBalance.toString()
      dataToSave.scanHeight = finalHeight
      dataToSave.scanTarget = finalHeight
      dataToSave.birthdayScanDone = true
      dataToSave.totalOutputs = summary.totalOutputs
      dataToSave.spentOutputs = summary.spentOutputs
      dataToSave.spendDetectionMode = getSpendDetectionMode(nextOutputs)
      dataToSave.outputs = nextOutputs

      try {
        const walletData: DataView[] = await wallet.getData()
        const keysBytes = new Uint8Array(
          walletData[0].buffer,
          walletData[0].byteOffset,
          walletData[0].byteLength
        )
        const cacheBytes = new Uint8Array(
          walletData[1].buffer,
          walletData[1].byteOffset,
          walletData[1].byteLength
        )
        dataToSave.walletKeysData = Buffer.from(keysBytes).toString('base64')
        dataToSave.walletCacheData = Buffer.from(cacheBytes).toString('base64')
      } catch (err: any) {
        console.error('Monero wallet state save failed:', err?.message || err)
      }

      if (!isCurrentSyncEpoch(publicKeyEcdsa, syncEpoch)) {
        return
      }

      await queueSave(dataToSave, true)
      onProgress?.(finalHeight, finalHeight)
      return
    } catch (err: any) {
      lastError = err
      console.error('Monero sync failed:', err?.message || err)
      if (!isCurrentSyncEpoch(publicKeyEcdsa, syncEpoch)) {
        return
      }
      const daemonHeight = await wallet
        ?.getDaemonHeight?.()
        .catch(() => minHeight)
      const freshData = await storage.load(publicKeyEcdsa)
      const dataToSave = freshData ?? scanData
      dataToSave.address = address
      dataToSave.scanHeight = Math.max(
        dataToSave.scanHeight ?? 0,
        scanData?.scanHeight ?? 0,
        latestHeight,
        minHeight
      )
      dataToSave.scanTarget = Math.max(
        daemonHeight ?? minHeight,
        scanData?.scanTarget ?? 0,
        latestTarget,
        dataToSave.scanHeight ?? 0,
        minHeight
      )
      await queueSave(dataToSave, true)
    } finally {
      await wallet?.close?.().catch(() => {})
    }
  }

  onProgress?.(1, 1)
  throw lastError instanceof Error
    ? lastError
    : new Error('Monero sync did not complete')
}
