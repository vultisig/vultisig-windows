import { NATIVE_MINT, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import {
  Connection,
  PublicKey,
  VersionedMessage,
  VersionedTransaction,
} from '@solana/web3.js'

type MintAmount = { mint: string; amount: bigint }
type SimulateSolanaTransactionInput = {
  conn: Connection
  tx: VersionedTransaction
  keysIn: PublicKey[]
  owners?: Set<string>
}
type SolanaSimulationIO = {
  inputs: MintAmount[]
  outputs: MintAmount[]
  solDeltaLamports: bigint
  feeLamports: bigint
  authority: string
}

const collectMessageKeys = (keys: PublicKey[]) => keys.map(k => k.toBase58())

const collectSigners = (
  msg: VersionedMessage,
  allKeys: PublicKey[]
): Set<string> => {
  const s = new Set<string>()
  const n = msg.header?.numRequiredSignatures ?? 0
  const keys = collectMessageKeys(allKeys)
  for (let i = 0; i < Math.min(n, keys.length); i++) s.add(keys[i])
  return s
}

const readU64LE = (buf: Buffer, off: number) =>
  BigInt.asUintN(64, buf.readBigUInt64LE(off))

const decodeSplTokenAccountRaw = (buf: Buffer) => {
  if (buf.length < 165) return null
  const mint = new PublicKey(buf.subarray(0, 32)).toBase58()
  const owner = new PublicKey(buf.subarray(32, 64)).toBase58()
  const amount = readU64LE(buf, 64)
  return { mint, owner, amount }
}

const decodeSplTokenAccountBase64 = (b64: string) => {
  const buf = Buffer.from(b64, 'base64')
  return decodeSplTokenAccountRaw(buf)
}

const normalizeSolWithFee = (io: {
  inputs: MintAmount[]
  outputs: MintAmount[]
  solDeltaLamports: bigint
  feeLamports: bigint
}) => {
  const inputs = [...io.inputs]
  const outputs = [...io.outputs]

  if (io.solDeltaLamports < 0n) {
    const amt = -io.solDeltaLamports - io.feeLamports
    const solInput = inputs.find(i => i.mint === NATIVE_MINT.toBase58())
    if (solInput) {
      solInput.amount = amt
    } else {
      inputs.push({ mint: NATIVE_MINT.toBase58(), amount: amt })
    }
  } else if (io.solDeltaLamports > 0n) {
    const netAmt = io.solDeltaLamports + io.feeLamports
    const solOutput = outputs.find(o => o.mint === NATIVE_MINT.toBase58())
    if (solOutput) {
      solOutput.amount = netAmt
    } else if (netAmt > 0n) {
      outputs.push({ mint: NATIVE_MINT.toBase58(), amount: netAmt })
    }
  }

  return { ...io, inputs, outputs }
}

export const simulateSolanaTransaction = async ({
  conn,
  tx,
  keysIn,
  owners,
}: SimulateSolanaTransactionInput): Promise<SolanaSimulationIO | null> => {
  const message = tx.message
  if (!message) return null

  const staticKeys: PublicKey[] =
    (message.staticAccountKeys as PublicKey[]) ?? []

  const payerKey = staticKeys[0]
  const payerB58 = payerKey.toBase58()
  // Use the provided keys list as the simulate "addresses" in the same order
  const addresses = collectMessageKeys(keysIn)

  // Find the payer’s index inside the addresses array we pass to simulate
  const payerIndex = addresses.indexOf(payerB58)
  if (payerIndex < 0)
    console.warn('[previewIO] payer not found in provided keysIn order')

  if (addresses.length === 0) return null

  // PRE (raw)
  const preInfos = await conn.getMultipleAccountsInfo(
    addresses.map(a => new PublicKey(a)),
    { commitment: 'processed' }
  )

  // SIMULATE (POST base64)
  const sim = await conn.simulateTransaction(tx, {
    sigVerify: false,
    replaceRecentBlockhash: true,
    commitment: 'processed',
    accounts: { encoding: 'base64', addresses },
  })

  const postAccounts = sim.value?.accounts ?? []

  let feeLamports = 0n
  try {
    const feeResp = await conn.getFeeForMessage((tx as any).message, {
      commitment: 'processed',
    } as any)
    feeLamports = BigInt(feeResp.value ?? 0)
  } catch (e) {
    console.warn('[previewIO] getFeeForMessage failed, fee=0. reason:', e)
  }

  // Owners defaults to signers (from message header)
  const ownerSet =
    owners && owners.size ? owners : collectSigners(message, staticKeys)

  // Aggregate SPL token deltas by "owner|mint"
  const byKey = new Map<string, { pre?: bigint; post?: bigint }>()
  let sawWSOLDelta = false

  for (let i = 0; i < addresses.length; i++) {
    const pre = preInfos[i]
    const post: any = postAccounts[i]

    // PRE SPL (raw)
    let preOwner: string | undefined
    let preMint: string | undefined
    let preAmt: bigint | undefined
    if (
      pre?.owner?.equals?.(TOKEN_PROGRAM_ID) &&
      Buffer.isBuffer(pre.data) &&
      pre.data.length >= 165
    ) {
      const tok = decodeSplTokenAccountRaw(pre.data as Buffer)
      if (tok && ownerSet.has(tok.owner)) {
        preOwner = tok.owner
        preMint = tok.mint
        preAmt = tok.amount
      }
    }

    // POST SPL (base64)
    let postOwner: string | undefined
    let postMint: string | undefined
    let postAmt: bigint | undefined
    if (Array.isArray(post?.data) && post.data[1] === 'base64') {
      const [b64] = post.data as [string, 'base64']
      const tok = decodeSplTokenAccountBase64(b64)
      if (tok && ownerSet.has(tok.owner)) {
        postOwner = tok.owner
        postMint = tok.mint
        postAmt = tok.amount
      }
    }

    const owner = postOwner ?? preOwner
    const mint = postMint ?? preMint
    if (!owner || !mint) continue
    const k = `${owner}|${mint}`
    const bucket = byKey.get(k) ?? {}
    if (preAmt != null) bucket.pre = preAmt
    if (postAmt != null) bucket.post = postAmt
    byKey.set(k, bucket)

    if (
      mint === NATIVE_MINT.toBase58() &&
      (bucket.pre ?? 0n) !== (bucket.post ?? 0n)
    ) {
      sawWSOLDelta = true
    }
  }

  // Compute token deltas
  const inputs: MintAmount[] = []
  const outputs: MintAmount[] = []
  for (const [k, v] of byKey) {
    const [, mint] = k.split('|')
    const pre = v.pre ?? 0n
    const post = v.post ?? 0n
    const d = post - pre
    if (d < 0n) inputs.push({ mint, amount: -d })
    else if (d > 0n) outputs.push({ mint, amount: d })
  }

  // SOL delta
  let solDeltaLamports = 0n
  if (payerIndex >= 0) {
    const payerPre = BigInt(preInfos[payerIndex]?.lamports ?? 0)
    const payerPost = BigInt((postAccounts[payerIndex] as any)?.lamports ?? 0)
    solDeltaLamports = payerPost - payerPre
  } else {
    console.warn('[previewIO] cannot compute payer SOL delta (payerIndex < 0)')
  }

  // Map SOL delta into outputs/inputs ONLY IF we didn’t already account for WSOL
  // (Prevents double counting when converting WSOL<->SOL in the same tx.)
  if (!sawWSOLDelta) {
    if (solDeltaLamports > 0n) {
      outputs.push({ mint: NATIVE_MINT.toBase58(), amount: solDeltaLamports })
    } else if (solDeltaLamports < 0n) {
      inputs.push({ mint: NATIVE_MINT.toBase58(), amount: -solDeltaLamports })
    }
  }

  return {
    ...normalizeSolWithFee({
      inputs,
      outputs,
      solDeltaLamports,
      feeLamports,
    }),
    authority: [...ownerSet][0],
  }
}
