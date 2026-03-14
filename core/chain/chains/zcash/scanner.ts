import {
  frozt_sapling_build_dfvk,
  frozt_sapling_compute_nullifier,
  frozt_sapling_decrypt_note_full,
  frozt_sapling_derive_keys,
  frozt_sapling_tree_size,
  frozt_sapling_try_decrypt_compact,
  WasmSaplingTree,
  WasmSaplingWitness,
} from 'frozt-wasm'

import {
  getBlockRange,
  getLatestBlock,
  getTransaction,
  getTreeState,
} from './lightwalletd/client'
import { CompactBlock } from './lightwalletd/messages'
import {
  parseSaplingOutputs,
  parseSaplingSpendNullifiers,
} from './parseSaplingOutputs'
import { SaplingNote } from './SaplingNote'
import {
  getZcashSaplingSafeScanHeight,
  getZcashSaplingSpendableBalance,
} from './saplingSpending'
import {
  currentNullifierVersion,
  getZcashScanStorage,
  ZcashScanData,
} from './zcashScanStorage'

const batchSize = 500
const activeSyncs = new Map<string, Promise<ZcashScanData>>()

const scanLog = (tag: string, ...args: unknown[]) =>
  console.log(`[zcash-scan][${tag}]`, ...args)

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

const formatAddress = (address: string) =>
  `${address.slice(0, 10)}...${address.slice(-6)}`

const getSpendableBalanceFromNotes = (
  notes: SaplingNote[],
  chainHeight: number | null
): bigint => getZcashSaplingSpendableBalance(notes, chainHeight)

type ActiveWitness = {
  witness: WasmSaplingWitness
  nullifier: string
  noteIndex: number
}

type ScanParams = {
  zAddress: string
  publicKeyEcdsa: string
  pubKeyPackage: Uint8Array
  saplingExtras: Uint8Array
  onProgress?: (current: number, total: number) => void
}

type ScanState = {
  tree: WasmSaplingTree
  ivk: Uint8Array
  dfvk: Uint8Array
  zAddress: string
  notes: SaplingNote[]
  activeWitnesses: ActiveWitness[]
  nullifierSet: Set<string>
  treePosition: number
}

type FetchBudget = {
  remaining: number
}

export const getSpendableBalance = async (
  publicKeyEcdsa: string
): Promise<bigint> => {
  const scanData = await getZcashScanStorage().load(publicKeyEcdsa)
  if (!scanData) return BigInt(0)
  return getSpendableBalanceFromNotes(scanData.notes, scanData.scanHeight)
}

const saveScanData = async (
  scanData: ZcashScanData,
  state: ScanState
): Promise<void> => {
  for (const aw of state.activeWitnesses) {
    state.notes[aw.noteIndex].witnessData = toHex(aw.witness.serialize())
  }
  await getZcashScanStorage().save({ ...scanData, notes: state.notes })
}

const finalizeScanData = async (
  storage: ReturnType<typeof getZcashScanStorage>,
  scanData: ZcashScanData,
  endHeight: number,
  notes?: SaplingNote[]
): Promise<void> => {
  scanData.scanHeight = endHeight
  scanData.scanTarget = endHeight
  scanData.birthdayScanDone = true
  if (notes) {
    scanData.notes = notes
  }
  await storage.save(scanData)
}

type EnsureSyncParams = ScanParams & {
  force?: boolean
  birthHeight?: number | null
}

const shouldSyncScanData = (
  scanData: ZcashScanData | null,
  scanTargetHeight: number,
  force?: boolean
): boolean => {
  if (force) return true
  if (!scanData) return true
  if (scanData.nullifierVersion !== currentNullifierVersion) return true
  if (!scanData.birthdayScanDone) return true
  if (scanData.scanHeight == null) return true
  return scanData.scanHeight < scanTargetHeight
}

const normalizeForwardOnlyScanData = (
  scanData: ZcashScanData | null
): ZcashScanData | null => {
  if (!scanData) return scanData
  if (scanData.birthHeight != null) return scanData
  if (scanData.scanHeight == null) return scanData
  if (scanData.birthdayScanDone) return scanData

  return {
    ...scanData,
    birthdayScanDone: true,
  }
}

export const ensureZcashScanDataSynced = async ({
  zAddress,
  publicKeyEcdsa,
  pubKeyPackage,
  saplingExtras,
  onProgress,
  force = false,
  birthHeight,
}: EnsureSyncParams): Promise<ZcashScanData> => {
  const active = activeSyncs.get(publicKeyEcdsa)
  if (active) return active

  const promise = (async () => {
    const storage = getZcashScanStorage()
    const stored = await storage.load(publicKeyEcdsa)
    const existing = normalizeForwardOnlyScanData(stored)

    if (existing && existing !== stored) {
      await storage.save(existing)
    }

    let scanData = existing

    if (birthHeight != null && (!scanData || scanData.birthHeight == null)) {
      scanData = {
        ...(scanData ?? {
          zAddress,
          publicKeyEcdsa,
          scanHeight: null,
          scanTarget: null,
          birthHeight: null,
          birthdayScanDone: false,
          pubKeyPackage: Buffer.from(pubKeyPackage).toString('base64'),
          saplingExtras: Buffer.from(saplingExtras).toString('base64'),
          notes: [],
          nullifierVersion: currentNullifierVersion,
        }),
        zAddress,
        birthHeight,
      }

      await storage.save(scanData)
    }

    const latestBlock = await getLatestBlock()
    const scanTargetHeight = getZcashSaplingSafeScanHeight(latestBlock.height)
    if (shouldSyncScanData(scanData, scanTargetHeight, force)) {
      scanLog('sync-start', {
        address: formatAddress(zAddress),
        force,
        chainTip: latestBlock.height,
        scanTargetHeight,
        scanHeight: scanData?.scanHeight ?? null,
        birthHeight: scanData?.birthHeight ?? null,
        birthdayScanDone: scanData?.birthdayScanDone ?? false,
        knownNotes: scanData?.notes.length ?? 0,
        knownUnspentNotes:
          scanData?.notes.filter(note => !note.spent).length ?? 0,
        knownSpendableZats: getSpendableBalanceFromNotes(
          scanData?.notes ?? [],
          scanData?.scanHeight ?? null
        ).toString(),
      })
      await scanBlocks({
        zAddress,
        publicKeyEcdsa,
        pubKeyPackage,
        saplingExtras,
        onProgress,
      })
    }

    const synced = await storage.load(publicKeyEcdsa)
    if (!synced) {
      throw new Error('Zcash scan data missing after sync')
    }
    return synced
  })().finally(() => {
    activeSyncs.delete(publicKeyEcdsa)
  })

  activeSyncs.set(publicKeyEcdsa, promise)
  return promise
}

export const scanBlocks = async ({
  zAddress,
  publicKeyEcdsa,
  pubKeyPackage,
  saplingExtras,
  onProgress,
}: ScanParams): Promise<void> => {
  const storage = getZcashScanStorage()
  let scanData = await storage.load(publicKeyEcdsa)

  if (!scanData) {
    scanData = {
      zAddress,
      publicKeyEcdsa,
      scanHeight: null,
      scanTarget: null,
      birthHeight: null,
      birthdayScanDone: false,
      pubKeyPackage: Buffer.from(pubKeyPackage).toString('base64'),
      saplingExtras: Buffer.from(saplingExtras).toString('base64'),
      notes: [],
      nullifierVersion: currentNullifierVersion,
    }
  } else {
    scanData.zAddress = zAddress
  }

  if (scanData.nullifierVersion !== currentNullifierVersion) {
    scanLog('migration', 'clearing notes for nullifier version upgrade')
    scanData.notes = []
    scanData.scanHeight = null
    scanData.birthdayScanDone = false
    scanData.nullifierVersion = currentNullifierVersion
    await storage.save(scanData)
  }

  const savedHeight = scanData.scanHeight
  const birthHeight = scanData.birthHeight
  const latestBlock = await getLatestBlock()
  const chainTip = latestBlock.height
  const endHeight = getZcashSaplingSafeScanHeight(chainTip)

  const needsBirthdayRescan =
    birthHeight !== null && !scanData.birthdayScanDone && savedHeight === null

  let startHeight: number
  if (savedHeight !== null && savedHeight > 0) {
    startHeight = savedHeight + 1
  } else if (birthHeight !== null) {
    startHeight = birthHeight
  } else {
    startHeight = endHeight
  }

  scanData.scanTarget = endHeight
  await storage.save(scanData)

  scanLog('start', {
    address: formatAddress(zAddress),
    startHeight,
    endHeight,
    chainTip,
    birthHeight,
    savedHeight,
    needsBirthdayRescan,
    knownNotes: scanData.notes.length,
    knownUnspentNotes: scanData.notes.filter(note => !note.spent).length,
    knownSpendableZats: getSpendableBalanceFromNotes(
      scanData.notes,
      scanData.scanHeight
    ).toString(),
  })

  if (startHeight > endHeight) {
    await finalizeScanData(storage, scanData, endHeight)
    scanLog('done', {
      scannedFrom: startHeight,
      scannedTo: endHeight,
      totalNotes: scanData.notes.length,
      unspentNotes: scanData.notes.filter(note => !note.spent).length,
      spentNotes: scanData.notes.filter(note => note.spent).length,
      spendableZats: getSpendableBalanceFromNotes(
        scanData.notes,
        endHeight
      ).toString(),
    })
    onProgress?.(endHeight, endHeight)
    return
  }

  const saplingKeys = frozt_sapling_derive_keys(pubKeyPackage, saplingExtras)
  const ivk = saplingKeys.ivk
  const dfvk = frozt_sapling_build_dfvk(pubKeyPackage, saplingExtras)

  const treeState = await getTreeState(Math.max(startHeight - 1, 0))
  const tree = WasmSaplingTree.fromHexState(treeState.saplingTree)

  const notes = [...scanData.notes]
  const activeWitnesses: ActiveWitness[] = []

  for (let i = 0; i < notes.length; i++) {
    const note = notes[i]
    if (note.spent || !note.witnessData) continue
    const witness = WasmSaplingWitness.fromBytes(
      new Uint8Array(Buffer.from(note.witnessData, 'hex'))
    )
    activeWitnesses.push({ witness, nullifier: note.nullifier, noteIndex: i })
  }

  const nullifierSet = new Set<string>()
  for (const note of notes) {
    if (!note.spent && note.nullifier) {
      nullifierSet.add(note.nullifier)
    }
  }

  const treePosition = getInitialTreePosition(treeState.saplingTree)

  const state: ScanState = {
    tree,
    ivk,
    dfvk,
    zAddress,
    notes,
    activeWitnesses,
    nullifierSet,
    treePosition,
  }
  for (
    let batchStart = startHeight;
    batchStart <= endHeight;
    batchStart += batchSize
  ) {
    const batchEnd = Math.min(batchStart + batchSize - 1, endHeight)
    const compactBlocks = await getBlockRange(batchStart, batchEnd)
    const fetchBudget: FetchBudget = { remaining: 20 }
    for (const block of compactBlocks) {
      await processBlock(state, block, fetchBudget)
    }

    scanData.scanHeight = batchEnd
    await saveScanData(scanData, state)

    const verify = await storage.load(publicKeyEcdsa)
    if (verify?.scanHeight !== batchEnd) {
      scanLog('save-failed', {
        expected: batchEnd,
        got: verify?.scanHeight,
      })
    }

    onProgress?.(batchEnd, endHeight)
  }

  scanLog('done', {
    totalNotes: state.notes.length,
    unspentNotes: state.notes.filter(note => !note.spent).length,
    spentNotes: state.notes.filter(note => note.spent).length,
    spendableZats: getSpendableBalanceFromNotes(
      state.notes,
      endHeight
    ).toString(),
    scannedFrom: startHeight,
    scannedTo: endHeight,
  })

  await finalizeScanData(storage, scanData, endHeight, state.notes)
  onProgress?.(endHeight, endHeight)
}

const markNoteSpent = (state: ScanState, nfHex: string): boolean => {
  let matched = false
  for (let i = 0; i < state.notes.length; i++) {
    if (state.notes[i].nullifier === nfHex) {
      state.notes[i].spent = true
      matched = true
    }
  }
  if (matched) {
    state.nullifierSet.delete(nfHex)
    return true
  }
  return false
}

const fetchSpendNullifiersFromRawTx = async (
  txHash: Uint8Array
): Promise<string[]> => {
  try {
    const rawTx = await getTransaction(txHash)
    const nullifiers = parseSaplingSpendNullifiers(rawTx.data)
    return nullifiers.map(toHex)
  } catch {
    return []
  }
}

const processBlock = async (
  state: ScanState,
  block: CompactBlock,
  fetchBudget: FetchBudget
): Promise<void> => {
  for (const tx of block.vtx) {
    if (tx.spends.length > 0) {
      for (const spend of tx.spends) {
        const nfHex = toHex(spend.nf)
        if (state.nullifierSet.has(nfHex)) {
          markNoteSpent(state, nfHex)
        }
      }
    } else if (state.nullifierSet.size > 0 && fetchBudget.remaining > 0) {
      fetchBudget.remaining--
      const rawNullifiers = await fetchSpendNullifiersFromRawTx(tx.hash)
      for (const nfHex of rawNullifiers) {
        if (state.nullifierSet.has(nfHex)) {
          markNoteSpent(state, nfHex)
        }
      }
    }

    for (let outputIdx = 0; outputIdx < tx.outputs.length; outputIdx++) {
      const output = tx.outputs[outputIdx]

      for (const aw of state.activeWitnesses) {
        aw.witness.append(output.cmu)
      }

      state.tree.append(output.cmu)
      state.treePosition++

      const result = frozt_sapling_try_decrypt_compact(
        state.ivk,
        output.cmu,
        output.ephemeralKey,
        output.ciphertext,
        BigInt(block.height)
      )

      if (result === null || result === undefined) continue

      const noteValue = typeof result === 'number' ? result : Number(result)
      const witness = state.tree.witness()
      const cmuHex = toHex(output.cmu)
      const witnessPosition = state.treePosition - 1

      await storeDecryptedNote({
        state,
        txHash: tx.hash,
        outputIdx,
        cmuHex,
        noteValue,
        witnessPosition,
        witness,
        block,
      })
    }
  }
}

const storeDecryptedNote = async ({
  state,
  txHash,
  outputIdx,
  cmuHex,
  noteValue,
  witnessPosition,
  witness,
  block,
}: {
  state: ScanState
  txHash: Uint8Array
  outputIdx: number
  cmuHex: string
  noteValue: number
  witnessPosition: number
  witness: WasmSaplingWitness
  block: CompactBlock
}): Promise<void> => {
  const rawTx = await getTransaction(txHash)
  const saplingOutputs = parseSaplingOutputs(rawTx.data)
  const outputFields = saplingOutputs.get(cmuHex)
  if (!outputFields) return

  let noteData: Uint8Array
  try {
    noteData = frozt_sapling_decrypt_note_full(
      state.ivk,
      new Uint8Array(Buffer.from(cmuHex, 'hex')),
      outputFields.ephemeralKey,
      outputFields.encCiphertext,
      BigInt(block.height)
    )
  } catch {
    return
  }

  const nullifier = frozt_sapling_compute_nullifier(
    state.dfvk,
    noteData,
    BigInt(witnessPosition),
    BigInt(block.height)
  )
  const nullifierHex = toHex(nullifier)

  if (state.nullifierSet.has(nullifierHex)) {
    return
  }

  const note: SaplingNote = {
    txid: toHex(txHash),
    outputIndex: outputIdx,
    height: block.height,
    value: noteValue,
    rcm: '',
    cmu: cmuHex,
    nullifier: nullifierHex,
    witnessPosition,
    witnessPath: '',
    spent: false,
    createdAt: block.time,
    noteData: toHex(noteData),
    witnessData: toHex(witness.serialize()),
  }

  state.notes.push(note)
  state.nullifierSet.add(nullifierHex)
  state.activeWitnesses.push({
    witness,
    nullifier: nullifierHex,
    noteIndex: state.notes.length - 1,
  })
}

const getInitialTreePosition = (saplingTreeHex: string): number => {
  if (!saplingTreeHex) return 0
  return Number(frozt_sapling_tree_size(saplingTreeHex))
}
