/**
 * Keysign stability (F-160): N sequential sign-only keysigns through the dApp
 * Solana path. Each round is ed25519-verified against the vault pubkey. No
 * funds move — the signed self-transfer is never broadcast.
 */

import { ed25519 } from '@noble/curves/ed25519'
import { VersionedTransaction } from '@solana/web3.js'

import { expect, test } from '../fixtures/extension-loader'
import {
  signSolanaSelfTransferViaDapp,
  startTestDappServer,
  type TestDappServer,
} from '../helpers/solana-dapp-sign'
import {
  ensureVaultExists,
  getVaultConfigFromEnv,
} from '../helpers/vault-import'

const defaultRounds = 3
const perRoundTimeoutMs = 240_000
const rounds = Number(process.env.KEYSIGN_STABILITY_ROUNDS ?? defaultRounds)

const verifiesAgainstPayer = (
  signedBase64: string,
  payerBytes: Uint8Array
): boolean => {
  const signed = VersionedTransaction.deserialize(
    new Uint8Array(Buffer.from(signedBase64, 'base64'))
  )
  const signature = signed.signatures[0]
  return (
    signature !== undefined &&
    signature.some(byte => byte !== 0) &&
    ed25519.verify(signature, signed.message.serialize(), payerBytes)
  )
}

test.describe('Keysign stability', () => {
  let dapp: TestDappServer

  test.beforeAll(async () => {
    dapp = await startTestDappServer()
  })

  test.afterAll(() => {
    dapp?.close()
  })

  test(`${rounds} sequential sign-only keysigns all verify`, async ({
    context,
    extensionId,
  }) => {
    const config = getVaultConfigFromEnv()
    test.skip(
      !config,
      'Requires the designated TEST_VAULT_PATH and TEST_VAULT_PASSWORD fixture'
    )
    test.setTimeout(rounds * perRoundTimeoutMs)

    const { vaultPath, password } = config!
    expect(
      await ensureVaultExists(context, extensionId, vaultPath, password)
    ).toBe(true)

    const durationsMs: number[] = []
    for (let round = 1; round <= rounds; round++) {
      const startedAt = Date.now()
      const { signedBase64, payer } = await signSolanaSelfTransferViaDapp({
        context,
        extensionId,
        password,
        dappUrl: dapp.url,
      })
      durationsMs.push(Date.now() - startedAt)
      console.log(
        `[keysign stability] round ${round}/${rounds}: ${durationsMs.at(-1)}ms`
      )

      expect(
        verifiesAgainstPayer(signedBase64, payer.toBytes()),
        `round ${round} signature must verify against the vault Solana pubkey`
      ).toBe(true)
    }

    console.log(`[keysign stability] durations ms: ${durationsMs.join(', ')}`)
    expect(durationsMs).toHaveLength(rounds)
  })
})
