import { Chain } from '@core/chain/Chain'
import {
  getChainHeight,
  getFeeEstimate,
  getOutputDistribution,
  getOuts,
} from '@core/chain/chains/monero/daemonRpc'
import {
  getMoneroScanStorage,
  MoneroStoredOutput,
} from '@core/chain/chains/monero/moneroScanStorage'
import { ensureMoneroScanDataSynced } from '@core/chain/chains/monero/scanner'
import { isSpendableStoredMoneroOutput } from '@core/chain/chains/monero/spending'
import { initializeFromt } from '@core/mpc/fromt/initialize'
import { Vault } from '@core/mpc/vault/Vault'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
const ringLen = 16
const defaultLockWindow = 10
const blockTime = 120
const blocksPerYear = Math.floor((365 * 24 * 60 * 60) / blockTime)

const getFromtBuildSignableTx = async () => {
  const { fromt_build_signable_tx } =
    await import('../../../../lib/fromt/fromt_wasm')
  return fromt_build_signable_tx
}

type MoneroOwnedOutput = {
  amount: bigint
  keyOffset: Uint8Array
  outputKey: Uint8Array
  commitmentMask: Uint8Array
  globalIndex: bigint
  outputKeyHex: string
}

type OutputDistribution = {
  distribution: number[]
  base: number
}

export type MoneroPreparedTx = {
  signableTx: Uint8Array
  senderAddress?: string
  publicKeyEcdsa: string
  spentOutputKeys: string[]
}

type PrepareInput = {
  vault: Vault
  senderAddress: string
  toAddress: string
  amount: bigint
  fee?: number
}

const hexToBytes = (hex: string): Uint8Array =>
  new Uint8Array(hex.match(/.{2}/g)!.map(b => parseInt(b, 16)))

const hasSpendMetadata = (
  output: MoneroStoredOutput
): output is MoneroStoredOutput & {
  commitmentMaskHex: string
  globalIndex: string
} =>
  typeof output.commitmentMaskHex === 'string' &&
  output.commitmentMaskHex.length > 0 &&
  typeof output.globalIndex === 'string' &&
  output.globalIndex.length > 0

const loadOutputsFromStorage = async (
  publicKeyEcdsa: string
): Promise<MoneroOwnedOutput[]> => {
  const storage = getMoneroScanStorage()
  const scanData = await storage.load(publicKeyEcdsa)
  if (!scanData?.outputs || scanData.outputs.length === 0) {
    throw new Error(
      'No spendable Monero outputs found in storage. Run a scan first.'
    )
  }

  console.log('[loadOutputsFromStorage]', {
    total: scanData.outputs.length,
    scanHeight: scanData.scanHeight,
    outputs: scanData.outputs.map(o => ({
      h: o.height,
      spent: o.spent,
      frozen: o.frozen,
      locked: o.locked,
      hasKeyImage: !!o.keyImageHex,
      hasMeta: !!(o.keyOffsetHex && o.commitmentMaskHex && o.globalIndex),
      key: o.outputKeyHex?.slice(0, 8),
    })),
  })

  return scanData.outputs
    .filter(o => isSpendableStoredMoneroOutput(o, scanData.scanHeight))
    .filter(hasSpendMetadata)
    .map(o => ({
      amount: BigInt(o.amount),
      keyOffset: hexToBytes(o.keyOffsetHex),
      outputKey: hexToBytes(o.outputKeyHex),
      commitmentMask: hexToBytes(o.commitmentMaskHex),
      globalIndex: BigInt(o.globalIndex),
      outputKeyHex: o.outputKeyHex,
    }))
}

const randomFloat = (): number => {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error(
      'Secure random source unavailable for Monero decoy selection'
    )
  }

  const bytes = new Uint32Array(1)
  globalThis.crypto.getRandomValues(bytes)
  return bytes[0] / 0x1_0000_0000
}

const randomInt = (maxExclusive: number): number => {
  if (maxExclusive <= 0) return 0
  return Math.floor(randomFloat() * maxExclusive)
}

const selectDecoys = async (
  realGlobalIndex: bigint,
  realOutputKey: Uint8Array,
  realCommitment: Uint8Array,
  outputDistribution: OutputDistribution
): Promise<{
  ringMembers: Array<{
    outputKey: Uint8Array
    commitment: Uint8Array
    globalIndex: bigint
  }>
  realIndex: number
}> => {
  const dist = outputDistribution.distribution

  const highestBound =
    dist.length > defaultLockWindow
      ? dist[dist.length - defaultLockWindow]
      : dist[dist.length - 1]

  const perSecond = (() => {
    const blocks = Math.min(dist.length, blocksPerYear)
    const initial = dist[Math.max(0, dist.length - blocks - 1)]
    const outputs = dist[dist.length - 1] - initial
    return outputs / (blocks * blockTime)
  })()

  const doNotSelect = new Set<bigint>()
  doNotSelect.add(realGlobalIndex)

  const decoyCount = ringLen - 1
  const candidates: bigint[] = []

  while (candidates.length < decoyCount) {
    const gammaShape = 19.28
    const gammaScale = 1.0 / 1.61
    let u = 1
    for (let k = 0; k < Math.ceil(gammaShape); k++) {
      u *= randomFloat()
    }
    let age = Math.exp(-Math.log(u) * gammaScale)

    const tipApplication = defaultLockWindow * blockTime
    if (age > tipApplication) {
      age -= tipApplication
    } else {
      age = randomInt(15 * blockTime)
    }

    const o = Math.floor(age * perSecond)
    if (o < highestBound) {
      const idx = dist.findIndex(s => s >= highestBound - 1 - o)
      const prev = Math.max(0, idx - 1)
      const n = dist[idx] - dist[prev]
      if (n > 0) {
        const selected = BigInt(dist[prev]) + BigInt(randomInt(n))
        if (!doNotSelect.has(selected)) {
          candidates.push(selected)
          doNotSelect.add(selected)
        }
      }
    }
  }

  const indices = [...candidates, realGlobalIndex].sort((a, b) =>
    a < b ? -1 : a > b ? 1 : 0
  )
  const realIndex = indices.indexOf(realGlobalIndex)

  const outsData = await getOuts(indices.map(Number))

  const ringMembers = outsData.map((out, i) => ({
    outputKey: hexToBytes(out.key),
    commitment: hexToBytes(out.mask),
    globalIndex: indices[i],
  }))

  ringMembers[realIndex] = {
    outputKey: realOutputKey,
    commitment: realCommitment,
    globalIndex: realGlobalIndex,
  }

  return { ringMembers, realIndex }
}

const encodeInputsData = (outputs: MoneroOwnedOutput[]): Uint8Array => {
  const buf = new ArrayBuffer(4 + outputs.length * (8 + 32 + 32 + 32 + 8))
  const view = new DataView(buf)
  let offset = 0

  view.setUint32(offset, outputs.length, true)
  offset += 4

  for (const out of outputs) {
    view.setBigUint64(offset, out.amount, true)
    offset += 8
    new Uint8Array(buf, offset, 32).set(out.keyOffset)
    offset += 32
    new Uint8Array(buf, offset, 32).set(out.outputKey)
    offset += 32
    new Uint8Array(buf, offset, 32).set(out.commitmentMask)
    offset += 32
    view.setBigUint64(offset, out.globalIndex, true)
    offset += 8
  }

  return new Uint8Array(buf)
}

type RingData = {
  ringMembers: Array<{
    outputKey: Uint8Array
    commitment: Uint8Array
    globalIndex: bigint
  }>
  realIndex: number
}

const encodeDecoysData = (rings: RingData[]): Uint8Array => {
  let totalSize = 4
  for (const ring of rings) {
    totalSize += 4 + 4 + ring.ringMembers.length * (32 + 32 + 8)
  }

  const buf = new ArrayBuffer(totalSize)
  const view = new DataView(buf)
  let offset = 0

  view.setUint32(offset, rings.length, true)
  offset += 4

  for (const ring of rings) {
    view.setUint32(offset, ring.ringMembers.length, true)
    offset += 4
    view.setUint32(offset, ring.realIndex, true)
    offset += 4

    for (const member of ring.ringMembers) {
      new Uint8Array(buf, offset, 32).set(member.outputKey)
      offset += 32
      new Uint8Array(buf, offset, 32).set(member.commitment)
      offset += 32
      view.setBigUint64(offset, member.globalIndex, true)
      offset += 8
    }
  }

  return new Uint8Array(buf)
}

export const prepareMoneroSpendTx = async ({
  vault,
  senderAddress,
  toAddress,
  amount,
}: PrepareInput): Promise<MoneroPreparedTx> => {
  await initializeFromt()

  const keyShareBase64 = shouldBePresent(
    vault.chainKeyShares?.[Chain.Monero],
    'Monero keyshare'
  )
  const keyShare = new Uint8Array(Buffer.from(keyShareBase64, 'base64'))
  const publicKeyEcdsa = vault.publicKeys.ecdsa

  await ensureMoneroScanDataSynced({
    keyShareBase64,
    publicKeyEcdsa,
  })

  const [chainHeight, feeEstimate, ownedOutputs] = await Promise.all([
    getChainHeight(),
    getFeeEstimate(),
    loadOutputsFromStorage(publicKeyEcdsa),
  ])
  const distributionStartHeight = Math.max(0, chainHeight - 2 * blocksPerYear)
  const outputDistribution = await getOutputDistribution(
    distributionStartHeight,
    chainHeight
  )

  if (ownedOutputs.length === 0) {
    throw new Error('No spendable Monero outputs found')
  }

  ownedOutputs.sort((a, b) => (b.amount > a.amount ? 1 : -1))
  const roughFeeEstimate = BigInt(30_000_000)
  const needed = amount + roughFeeEstimate
  const selected: MoneroOwnedOutput[] = []
  let totalSelected = BigInt(0)
  for (const output of ownedOutputs) {
    selected.push(output)
    totalSelected += output.amount
    if (totalSelected >= needed) break
  }

  if (totalSelected < needed) {
    throw new Error(
      `Insufficient Monero balance: have ${totalSelected}, need ${needed}`
    )
  }

  const selectedOutsData = await getOuts(
    selected.map(output => Number(output.globalIndex))
  )
  const rings: RingData[] = []
  for (let i = 0; i < selected.length; i++) {
    const output = selected[i]
    const realCommitment = hexToBytes(selectedOutsData[i].mask)
    rings.push(
      await selectDecoys(
        output.globalIndex,
        output.outputKey,
        realCommitment,
        outputDistribution
      )
    )
  }

  const fromtBuildSignableTx = await getFromtBuildSignableTx()
  const signableTx = fromtBuildSignableTx(
    keyShare,
    toAddress,
    amount,
    BigInt(feeEstimate.fee),
    BigInt(feeEstimate.quantization_mask),
    encodeInputsData(selected),
    encodeDecoysData(rings)
  )

  return {
    signableTx,
    senderAddress,
    publicKeyEcdsa,
    spentOutputKeys: selected.map(output => output.outputKeyHex),
  }
}
