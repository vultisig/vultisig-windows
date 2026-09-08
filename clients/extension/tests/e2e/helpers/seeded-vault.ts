import '@vultisig/sdk/node'

import { MpcLib } from '@vultisig/core-mpc/mpcLib'
import {
  DklsEngine,
  ensureMpcEngine,
  MpcKeyshare,
  MpcSession,
  SchnorrEngine,
} from '@vultisig/mpc-types'

type KeygenEngine = Pick<
  DklsEngine | SchnorrEngine,
  'createKeygenSession' | 'keygenSetup'
>

/** One party's output from a fixture keygen, in the shape storage holds. */
export type GeneratedKeyshare = {
  chainCode: string
  keyshare: string
  publicKey: string
}

/** Both algorithms' shares for a single fixture vault. */
export type GeneratedVaultKeyshares = {
  ecdsa: GeneratedKeyshare
  eddsa: GeneratedKeyshare
}

/**
 * The party whose share the fixture keeps. A keysign session is set up under
 * the vault's `localPartyId`, so the keygen has to register that same string —
 * any vault built from these shares must declare this id.
 */
export const fixtureLocalPartyId = 'local-device'

/** The committee the fixture shares were generated for. */
export const fixtureKeygenCommittee = [fixtureLocalPartyId, 'device-2']

const runKeygen = async (engine: KeygenEngine): Promise<GeneratedKeyshare> => {
  const setup = engine.keygenSetup(
    undefined,
    fixtureKeygenCommittee.length,
    fixtureKeygenCommittee
  )
  const sessions = new Map<string, MpcSession<MpcKeyshare>>()

  for (const partyId of fixtureKeygenCommittee) {
    sessions.set(partyId, await engine.createKeygenSession(setup, partyId))
  }

  const completed = new Set<string>()
  for (
    let round = 0;
    round < 10 && completed.size < fixtureKeygenCommittee.length;
    round++
  ) {
    const messages: { body: Uint8Array; receivers: string[] }[] = []

    sessions.forEach(session => {
      let message = session.outputMessage()
      while (message) {
        messages.push({
          body: message.body,
          receivers: [...message.receivers],
        })
        message = session.outputMessage()
      }
    })

    if (messages.length === 0) {
      throw new Error('MPC fixture keygen stalled')
    }

    messages.forEach(message => {
      message.receivers.forEach(receiver => {
        const session = sessions.get(receiver)
        if (session?.inputMessage(message.body)) {
          completed.add(receiver)
        }
      })
    })
  }

  if (completed.size !== fixtureKeygenCommittee.length) {
    throw new Error('MPC fixture keygen did not complete')
  }

  const session = sessions.get(fixtureLocalPartyId)

  if (!session) {
    throw new Error(
      `MPC fixture keygen produced no session for ${fixtureLocalPartyId}`
    )
  }

  const results = new Map<string, GeneratedKeyshare>()

  for (const [partyId, partySession] of sessions) {
    const keyshare = await partySession.finish()
    results.set(partyId, {
      chainCode: Buffer.from(keyshare.rootChainCode()).toString('hex'),
      keyshare: Buffer.from(keyshare.toBytes()).toString('base64'),
      publicKey: Buffer.from(keyshare.publicKey()).toString('hex'),
    })
    keyshare.free?.()
    partySession.free?.()
  }

  const result = results.get(fixtureLocalPartyId)

  if (!result) {
    throw new Error(
      `MPC fixture keygen produced no share for ${fixtureLocalPartyId}`
    )
  }

  return result
}

let keyshares: Promise<GeneratedVaultKeyshares> | undefined

/**
 * Runs a real two-party DKLS and Schnorr keygen in-process and returns the
 * first party's shares. Since #4820 the app refuses to open a vault whose
 * shares it cannot deserialize, so a seeded vault needs shares that genuinely
 * round-trip through the MPC libraries — a placeholder string will not do.
 *
 * Memoized per worker: the keygen costs a few seconds and every caller wants
 * the same throwaway identity. A failed keygen clears the memo so the next
 * call — including a Playwright retry, which reuses the worker process —
 * starts a fresh attempt instead of rethrowing the cached rejection.
 */
export const generateVaultKeyshares = (): Promise<GeneratedVaultKeyshares> => {
  keyshares ??= (async () => {
    const mpc = await ensureMpcEngine()
    await mpc.initialize()

    const [ecdsa, eddsa] = await Promise.all([
      runKeygen(mpc.dkls),
      runKeygen(mpc.schnorr),
    ])

    return { ecdsa, eddsa }
  })().catch(error => {
    keyshares = undefined
    throw error
  })

  return keyshares
}

type CreateSeededVaultInput = {
  name: string
  /**
   * Defaults to `DKLS`. `KeyImport` is the only other value a seeded vault can
   * carry: `GG20` needs a legacy share validator that only the desktop app
   * supplies (via Wails), so the extension refuses every `GG20` vault outright.
   * Pass `KeyImport` when a spec needs the UI that keys off `libType !== 'DKLS'`.
   */
  libType?: Exclude<MpcLib, 'GG20'>
}

/**
 * Builds a single-signer vault that `chrome.storage.local` seeding can write
 * and the extension will actually open. The returned `vaultId` is what keys
 * `currentVaultId`, `vaultsCoins` and per-vault records, so callers must use it
 * rather than a hard-coded public key.
 */
export const createSeededVault = async ({
  name,
  libType = 'DKLS',
}: CreateSeededVaultInput) => {
  const { ecdsa, eddsa } = await generateVaultKeyshares()

  return {
    vaultId: ecdsa.publicKey,
    vault: {
      name,
      publicKeys: { ecdsa: ecdsa.publicKey, eddsa: eddsa.publicKey },
      signers: [fixtureLocalPartyId],
      createdAt: Date.now(),
      hexChainCode: ecdsa.chainCode,
      keyShares: { ecdsa: ecdsa.keyshare, eddsa: eddsa.keyshare },
      localPartyId: fixtureLocalPartyId,
      libType,
      isBackedUp: true,
      order: 0,
    },
  }
}
