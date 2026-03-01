import {
  frozt_sapling_decrypt_note_full,
  frozt_sapling_derive_ivk,
  frozt_sapling_derive_nk,
  frozt_sapling_try_decrypt_compact,
  WasmSaplingTree,
  WasmSaplingWitness,
} from '@lib/frozt/frozt_wasm'

import { loadBirthHeight } from './birthHeight'
import {
  getBlockRange,
  getLatestBlock,
  getTransaction,
  getTreeState,
} from './lightwalletd/client'
import { CompactBlock } from './lightwalletd/messages'
import { parseSaplingOutputs } from './parseSaplingOutputs'
import { computeNullifier } from './saplingCrypto'
import { loadSaplingNotes, SaplingNote, saveSaplingNotes } from './SaplingNote'
import { loadScanHeight, saveScanHeight } from './scanProgress'

const batchSize = 500

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

type ActiveWitness = {
  witness: WasmSaplingWitness
  nullifier: string
  noteIndex: number
}

type ScanParams = {
  zAddress: string
  pubKeyPackage: Uint8Array
  saplingExtras: Uint8Array
  onProgress?: (current: number, total: number) => void
}

type ScanState = {
  tree: WasmSaplingTree
  ivk: Uint8Array
  nk: Uint8Array
  zAddress: string
  notes: SaplingNote[]
  activeWitnesses: ActiveWitness[]
  nullifierSet: Set<string>
  treePosition: number
}

export const scanBlocks = async ({
  zAddress,
  pubKeyPackage,
  saplingExtras,
  onProgress,
}: ScanParams): Promise<void> => {
  const savedHeight = loadScanHeight(zAddress)
  const birthHeight = loadBirthHeight(zAddress)
  const latestBlock = await getLatestBlock()
  const endHeight = latestBlock.height

  let startHeight: number
  if (savedHeight !== null) {
    startHeight = savedHeight + 1
  } else if (birthHeight !== null) {
    startHeight = birthHeight
  } else {
    startHeight = endHeight
  }

  if (startHeight > endHeight) return

  const ivk = frozt_sapling_derive_ivk(pubKeyPackage, saplingExtras)
  const nk = frozt_sapling_derive_nk(saplingExtras)

  const treeState = await getTreeState(startHeight - 1)
  const tree = WasmSaplingTree.fromHexState(treeState.saplingTree)

  const notes = loadSaplingNotes(zAddress)
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

  const state: ScanState = {
    tree,
    ivk,
    nk,
    zAddress,
    notes,
    activeWitnesses,
    nullifierSet,
    treePosition: getInitialTreePosition(treeState.saplingTree),
  }

  for (
    let batchStart = startHeight;
    batchStart <= endHeight;
    batchStart += batchSize
  ) {
    const batchEnd = Math.min(batchStart + batchSize - 1, endHeight)
    const compactBlocks = await getBlockRange(batchStart, batchEnd)

    for (const block of compactBlocks) {
      await processBlock(state, block)
      saveScanHeight(zAddress, block.height)
    }

    onProgress?.(batchEnd, endHeight)
  }

  for (const aw of state.activeWitnesses) {
    state.notes[aw.noteIndex].witnessData = toHex(aw.witness.serialize())
  }
  saveSaplingNotes(zAddress, state.notes)
}

const processBlock = async (
  state: ScanState,
  block: CompactBlock
): Promise<void> => {
  for (const tx of block.vtx) {
    for (const spend of tx.spends) {
      const nfHex = toHex(spend.nf)
      if (state.nullifierSet.has(nfHex)) {
        const idx = state.notes.findIndex(n => n.nullifier === nfHex)
        if (idx >= 0) {
          state.notes[idx].spent = true
          state.nullifierSet.delete(nfHex)
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

  const noteData = frozt_sapling_decrypt_note_full(
    state.ivk,
    new Uint8Array(Buffer.from(cmuHex, 'hex')),
    outputFields.ephemeralKey,
    outputFields.encCiphertext,
    BigInt(block.height)
  )

  const nullifier = computeNullifier(
    Buffer.from(state.nk),
    witnessPosition,
    Buffer.from(cmuHex, 'hex')
  )
  const nullifierHex = nullifier.toString('hex')

  const note: SaplingNote = {
    txid: toHex(txHash),
    outputIndex: outputIdx,
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
  const hexPairs = saplingTreeHex.match(/.{2}/g)
  if (!hexPairs || hexPairs.length < 4) return 0
  const bytes = new Uint8Array(hexPairs.map(b => parseInt(b, 16)))
  const view = new DataView(bytes.buffer, bytes.byteOffset)
  return view.getUint32(0, true)
}
