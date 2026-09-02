/**
 * Keysign stability (F-160): N sequential sign-only keysigns through the dApp
 * Solana path. Each round is ed25519-verified against the vault pubkey. No
 * funds move — the signed self-transfer is never broadcast.
 */

import { ed25519 } from '@noble/curves/ed25519'
import { VersionedTransaction } from '@solana/web3.js'

import {
  startTestDappServer,
  type TestDappServer,
} from '../fixtures/dapp-page.fixture'
import { expect, test } from '../fixtures/extension-loader'
import { signSolanaSelfTransferViaDapp } from '../helpers/solana-dapp-sign'
import {
  ensureVaultExists,
  getVaultConfigFromEnv,
} from '../helpers/vault-import'

const defaultRounds = 3
const perRoundTimeoutMs = 240_000
// Vault import, blockhash fetch and page setup share the budget with the rounds.
const setupBudgetMs = 120_000
const parsedRounds = Number.parseInt(
  process.env.KEYSIGN_STABILITY_ROUNDS ?? '',
  10
)
const rounds =
  Number.isInteger(parsedRounds) && parsedRounds > 0
    ? parsedRounds
    : defaultRounds

type VerifiesAgainstPayerInput = {
  signedBase64: string
  payerBytes: Uint8Array
}

const verifiesAgainstPayer = ({
  signedBase64,
  payerBytes,
}: VerifiesAgainstPayerInput): boolean => {
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
  let dappServer: TestDappServer | null = null
  let dappUrl = ''

  test.beforeAll(async () => {
    dappServer = await startTestDappServer()
    dappUrl = dappServer.url
  })

  test.afterAll(() => {
    if (dappServer) {
      dappServer.close()
    }
  })

  test('sequential sign-only keysigns all verify', async ({
    context,
    extensionId,
  }) => {
    const config = getVaultConfigFromEnv()
    test.skip(
      !config,
      'Requires the designated TEST_VAULT_PATH and TEST_VAULT_PASSWORD fixture'
    )
    if (!config) return
    test.setTimeout(rounds * perRoundTimeoutMs + setupBudgetMs)

    const { vaultPath, password } = config
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
        dappUrl,
      })
      const durationMs = Date.now() - startedAt
      durationsMs.push(durationMs)
      console.log(
        `[keysign stability] round ${round}/${rounds}: ${durationMs}ms`
      )

      expect(
        verifiesAgainstPayer({ signedBase64, payerBytes: payer.toBytes() }),
        `round ${round} signature must verify against the vault Solana pubkey`
      ).toBe(true)
    }

    console.log(`[keysign stability] durations ms: ${durationsMs.join(', ')}`)
  })
})
