/**
 * Short-lived, cross-context cache for custom-message signatures.
 *
 * Some dApps (notably Paradex's Starknet-native onboarding, which signs the
 * fixed `{ action: "Onboarding" }` EIP-712 message) derive a private key from
 * the signature via a KDF and therefore require *deterministic* signing — the
 * same message must yield the same signature. Vultisig's MPC/TSS signing uses a
 * random nonce per ceremony, so it is non-deterministic by construction.
 *
 * This cache is a pragmatic, TEST-ONLY middle ground: when the *same* vault is
 * asked to sign the *exact same* custom message again within a short window, we
 * replay the previously produced signature instead of running a fresh keysign.
 * That makes a single login flow (e.g. consecutive onboarding signature
 * requests) observe a stable signature.
 *
 * It is backed by `chrome.storage.session`, NOT an in-memory Map, on purpose:
 * each Vultisig signing request opens a brand-new popup window with its own JS
 * memory, so a module-level Map cannot survive between the two requests. The
 * `session` area is in-memory (never written to disk) and shared across all
 * extension contexts (every popup window + the service worker), so the second
 * request can read what the first one stored.
 *
 * IMPORTANT — this does NOT fully solve deterministic signing:
 *   - `chrome.storage.session` is cleared when the browser restarts, and the
 *     service worker can be torn down. A replayed signature is a private-key
 *     seed for the dApp; we deliberately do NOT persist it to disk.
 *   - Because it is ephemeral, it cannot reproduce the same signature across
 *     sessions/devices. For Paradex specifically that means funds derived in
 *     one session are NOT recoverable in a later session — see issue #1147.
 *
 * Keyed by dApp origin + vault id + chain + method + message hash so one
 * dApp/vault/message cannot read another's cached signature.
 */

const ttlMs = 3 * 60 * 1000 // 3 minutes
const keyPrefix = 'sigcache:'

type CacheEntry = {
  signature: string
  expiresAt: number
}

type CacheKeyInput = {
  origin: string
  vaultId: string
  chain: string
  method: string
  hexMessage: string
}

const buildKey = ({
  origin,
  vaultId,
  chain,
  method,
  hexMessage,
}: CacheKeyInput): string =>
  `${keyPrefix}${origin}::${vaultId}::${chain}::${method}::${hexMessage}`

const now = (): number => Date.now()

// `chrome.storage.session` is available in popup + service worker contexts.
// Guard the access so non-extension contexts (e.g. unit tests) degrade to a
// no-op cache instead of throwing.
const sessionStorage = (): chrome.storage.SessionStorageArea | undefined =>
  typeof chrome !== 'undefined' ? chrome?.storage?.session : undefined

export const getCachedSignature = async (
  input: CacheKeyInput
): Promise<string | undefined> => {
  const store = sessionStorage()
  if (!store) return undefined

  const key = buildKey(input)
  const result = await store.get(key)
  const entry = result[key] as CacheEntry | undefined

  if (!entry) return undefined

  if (entry.expiresAt <= now()) {
    await store.remove(key)
    return undefined
  }

  return entry.signature
}

export const setCachedSignature = async (
  input: CacheKeyInput,
  signature: string
): Promise<void> => {
  const store = sessionStorage()
  if (!store) return

  const entry: CacheEntry = { signature, expiresAt: now() + ttlMs }
  await store.set({ [buildKey(input)]: entry })
}
