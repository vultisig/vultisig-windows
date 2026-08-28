/**
 * Sign-only Solana keysign through the dApp provider (signSolana splice path).
 *
 * Builds a 1-lamport self-transfer, hands it to the synthetic dApp page, walks
 * the extension's connect + sign popups, and returns the signed bytes. Nothing
 * is broadcast, so it needs no SOL — only a Fast Vault with Solana enabled.
 */

import { type BrowserContext, expect, type Page } from '@playwright/test'
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'
import http from 'http'

import { testDappHtml } from '../fixtures/dapp-page.fixture'
import { getVaultAddresses } from './vault-addresses'

const solanaRpcEndpoints = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-rpc.publicnode.com',
]

const driveDeadlineMs = 240_000
const popupPollMs = 1_500

export type TestDappServer = { url: string; close: () => void }

export async function startTestDappServer(): Promise<TestDappServer> {
  const server = http.createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(testDappHtml)
  })
  await new Promise<void>(resolve => {
    server.listen(0, '127.0.0.1', () => resolve())
  })
  const addr = server.address()
  const port = typeof addr === 'object' && addr ? addr.port : 0
  return { url: `http://127.0.0.1:${port}`, close: () => server.close() }
}

async function fetchSolanaBlockhash(): Promise<string> {
  for (const endpoint of solanaRpcEndpoints) {
    try {
      const { blockhash } = await new Connection(endpoint).getLatestBlockhash(
        'finalized'
      )
      if (blockhash) return blockhash
    } catch {
      // try the next endpoint
    }
  }
  throw new Error(
    'HARNESS: no Solana RPC endpoint reachable for getLatestBlockhash — not an app defect'
  )
}

type SubmitFastVaultPasswordIfPromptedInput = {
  popup: Page
  password: string
  probeTimeout?: number
}

export async function submitFastVaultPasswordIfPrompted({
  popup,
  password,
  probeTimeout = 5_000,
}: SubmitFastVaultPasswordIfPromptedInput): Promise<void> {
  const passwordInput = popup
    .locator(
      '[data-testid="fast-vault-password-input"], input[type="password"], input[placeholder*="password" i]'
    )
    .first()

  const isPasswordPromptVisible = await passwordInput
    .isVisible({ timeout: probeTimeout })
    .catch(() => false)
  if (!isPasswordPromptVisible) return

  await passwordInput.fill(password)

  const confirmButton = popup
    .locator('[data-testid="fast-vault-submit"]')
    .or(popup.getByRole('button', { name: /confirm/i }))
    .first()
  await expect(confirmButton).toBeEnabled({ timeout: 5_000 })
  await confirmButton.click()
}

type DriveApprovalPopupsInput = {
  context: BrowserContext
  extensionId: string
  result: ReturnType<Page['locator']>
  password: string
}

// A finished keysign leaves its popup on a "Done" screen; the next round's
// driver would keep finding that one instead of the fresh request.
async function closeExtensionPopups(
  context: BrowserContext,
  extensionId: string
): Promise<void> {
  await Promise.all(
    context
      .pages()
      .filter(
        p =>
          !p.isClosed() && p.url().includes(`chrome-extension://${extensionId}`)
      )
      .map(p => p.close().catch(() => {}))
  )
}

const findExtensionPopup = (
  context: BrowserContext,
  extensionId: string
): Page | undefined =>
  context
    .pages()
    .find(
      p =>
        !p.isClosed() && p.url().includes(`chrome-extension://${extensionId}`)
    )

// A "Try Again" screen means the keysign errored — surface the popup's own
// error text instead of spinning until timeout. The raw error hides behind
// the "Show exact error" card, so open it first.
async function throwKeysignPopupError(popup: Page): Promise<never> {
  await popup
    .getByText(/show exact error/i)
    .first()
    .click({ timeout: 3_000 })
    .catch(() => {})
  await popup.waitForTimeout(1_000)
  const popupText = await popup
    .locator('body')
    .innerText()
    .catch(() => '<unreadable>')
  throw new Error(
    `Keysign popup reported failure during dApp Solana signing:\n${popupText}`
  )
}

async function clickPrimaryAction(popup: Page): Promise<void> {
  // hasNotText guard: the name regex substring-matches, so without it
  // "Disconnect" satisfies /connect/ and "Sign out" satisfies /sign/.
  const primaryAction = popup
    .locator('[data-testid="approve-button"]')
    .or(
      popup
        .getByRole('button', {
          name: /approve|confirm|connect|sign|continue|next|allow/i,
        })
        .filter({ hasNotText: /disconnect|sign out|log out|reject/i })
    )
    .first()
  const canClick = await primaryAction
    .isEnabled({ timeout: 2_000 })
    .catch(() => false)
  if (canClick) await primaryAction.click().catch(() => {})
}

async function driveApprovalPopupsUntilResult({
  context,
  extensionId,
  result,
  password,
}: DriveApprovalPopupsInput): Promise<void> {
  const deadline = Date.now() + driveDeadlineMs

  while (Date.now() < deadline) {
    const resultText = (await result.textContent().catch(() => '')) ?? ''
    if (/^(SolanaSigned|Error):/.test(resultText)) return

    const popup = findExtensionPopup(context, extensionId)
    if (!popup) {
      await new Promise(resolve => setTimeout(resolve, 1_000))
      continue
    }

    // Short probe: the loop re-polls, so a slow password prompt is caught on
    // a later iteration without burning the drive deadline.
    await submitFastVaultPasswordIfPrompted({
      popup,
      password,
      probeTimeout: 500,
    }).catch(() => {})

    const buttonTexts = await popup
      .locator('button')
      .allTextContents()
      .catch(() => [] as string[])
    console.log(
      `[solana dApp sign] popup=${popup.url().slice(-40)} buttons=${JSON.stringify(buttonTexts)} result=${JSON.stringify(resultText)}`
    )
    if (buttonTexts.some(text => /try again/i.test(text))) {
      await throwKeysignPopupError(popup)
    }

    await clickPrimaryAction(popup)
    await new Promise(resolve => setTimeout(resolve, popupPollMs))
  }

  throw new Error(
    'Timed out driving the Solana dApp approval popups — no sign result surfaced'
  )
}

export type SignSolanaSelfTransferInput = {
  context: BrowserContext
  extensionId: string
  password: string
  dappUrl: string
}

export type SignedSolanaSelfTransfer = {
  signedBase64: string
  messageBase64: string
  payer: PublicKey
}

export async function signSolanaSelfTransferViaDapp({
  context,
  extensionId,
  password,
  dappUrl,
}: SignSolanaSelfTransferInput): Promise<SignedSolanaSelfTransfer> {
  const addresses = await getVaultAddresses(context)
  const solanaAddress = Object.entries(addresses).find(
    ([chain]) => chain.toLowerCase() === 'solana'
  )?.[1]
  if (!solanaAddress) {
    throw new Error(
      'Test vault has no Solana address in chrome.storage — enable the Solana chain on the test vault'
    )
  }

  const payer = new PublicKey(solanaAddress)
  const message = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: await fetchSolanaBlockhash(),
    instructions: [
      SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: payer,
        lamports: 1,
      }),
    ],
  }).compileToV0Message()
  const unsignedBase64 = Buffer.from(
    new VersionedTransaction(message).serialize()
  ).toString('base64')

  const page = await context.newPage()
  try {
    await page.goto(dappUrl)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForFunction(
      () => !!(window.vultisig?.solana || window.phantom?.solana),
      null,
      { timeout: 10_000 }
    )

    await page.locator('[data-testid="solana-tx-input"]').fill(unsignedBase64)
    await page.locator('[data-testid="solana-sign-tx"]').click()

    const result = page.locator('[data-testid="solana-sign-result"]')
    await driveApprovalPopupsUntilResult({
      context,
      extensionId,
      result,
      password,
    })

    const settled = (await result.textContent()) ?? ''
    if (settled.startsWith('Error:')) {
      throw new Error(
        `dApp signTransaction rejected (signSolana path, see sdk#2145): ${settled}`
      )
    }
    await expect(result).toHaveText(/^SolanaSigned: /, { timeout: 300_000 })

    return {
      signedBase64: settled.replace('SolanaSigned: ', ''),
      messageBase64: Buffer.from(message.serialize()).toString('base64'),
      payer,
    }
  } finally {
    await page.close()
    await closeExtensionPopups(context, extensionId)
  }
}
