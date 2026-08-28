/**
 * DApp Provider E2E Tests
 *
 * Tests the injected provider and DApp approval flows:
 * - window.ethereum injected on test DApp page
 * - eth_requestAccounts - popup opens - approve - address returned
 * - personal_sign - popup shows message - approve - signature returned
 * - wallet_switchEthereumChain - chainChanged event fires
 * - reject connection returns UserRejectedRequest error
 * - window.vultisig and its Solana provider are injected
 * - window.vultisig delegates the EIP-1193 surface without losing cross-chain keys
 */

import { ed25519 } from '@noble/curves/ed25519'
import type { BrowserContext, Page } from '@playwright/test'
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'
import http from 'http'

import { testDappHtml } from '../fixtures/dapp-page.fixture'
import { expect, test } from '../fixtures/extension-loader'
import { getVaultAddresses } from '../helpers/vault-addresses'
import {
  ensureVaultExists,
  getVaultConfigFromEnv,
} from '../helpers/vault-import'
import { DAppApproval } from '../page-objects/DAppApproval.po'

// Store DApp server at module level for sharing
let dappServer: http.Server | null = null
let dappUrl: string = ''

const connectedAccountPattern =
  /^Connected:\s+0x[a-fA-F0-9]{40}\s+\(Chain:\s+.+\)$/
const evmAddressPattern = /0x[a-fA-F0-9]{40}/
const signaturePattern = /^Signature:\s+0x[a-fA-F0-9]{130,}$/

type ExtensionContextInput = {
  context: BrowserContext
  extensionId: string
}

type ApproveRequiredDappRequestInput = ExtensionContextInput & {
  requestName: string
  waitForClose?: boolean
}

type SubmitFastVaultPasswordIfPromptedInput = {
  popup: Page
  password: string
  probeTimeout?: number
}

type ConnectDappWalletInput = ExtensionContextInput & {
  page: Page
}

test.describe('DApp Provider', () => {
  test.beforeAll(async () => {
    // Start DApp server
    dappServer = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(testDappHtml)
    })

    await new Promise<void>(resolve => {
      dappServer!.listen(0, '127.0.0.1', () => resolve())
    })

    const addr = dappServer.address()
    const port = typeof addr === 'object' && addr ? addr.port : 0
    dappUrl = `http://127.0.0.1:${port}`
  })

  test.afterAll(async () => {
    if (dappServer) {
      dappServer.close()
    }
  })

  /**
   * Helper to wait for and get approval popup
   */
  async function waitForApprovalPopup({
    context,
    extensionId,
  }: ExtensionContextInput): Promise<Page | null> {
    const existingPopup = context
      .pages()
      .find(
        (p: Page) =>
          !p.isClosed() && p.url().includes(`chrome-extension://${extensionId}`)
      )
    if (existingPopup) {
      await existingPopup.waitForLoadState('domcontentloaded')
      return existingPopup
    }

    // Wait for new page to open (approval popup)
    const popupPromise = context.waitForEvent('page', { timeout: 15000 })

    try {
      const popup = await popupPromise
      await popup.waitForLoadState('domcontentloaded')
      return popup
    } catch {
      // Try finding existing popup
      const pages = context.pages()
      const popup = pages.find((p: Page) =>
        p.url().includes(`chrome-extension://${extensionId}`)
      )
      return popup || null
    }
  }

  async function ensureDappProviderVault(
    input: ExtensionContextInput
  ): Promise<{ vaultPath: string; password: string }> {
    const { context, extensionId } = input
    const config = getVaultConfigFromEnv()
    if (!config) {
      throw new Error(
        'DApp provider approval tests require TEST_VAULT_PATH and TEST_VAULT_PASSWORD'
      )
    }

    const vaultReady = await ensureVaultExists(
      context,
      extensionId,
      config.vaultPath,
      config.password
    )

    if (!vaultReady) {
      throw new Error(
        'DApp provider approval tests require an imported test vault'
      )
    }

    return config
  }

  async function approveRequiredDappRequest(
    input: ApproveRequiredDappRequestInput
  ): Promise<DAppApproval> {
    const { context, extensionId, requestName, waitForClose = true } = input
    const popup = await waitForApprovalPopup({ context, extensionId })

    if (!popup || popup.isClosed()) {
      throw new Error(`${requestName} did not open a DApp approval popup`)
    }

    const approval = new DAppApproval(popup, extensionId)
    await approval.waitForView(10_000)
    await approval.approve()
    if (waitForClose) {
      await approval.waitForClose()
    }

    return approval
  }

  async function submitFastVaultPasswordIfPrompted(
    input: SubmitFastVaultPasswordIfPromptedInput
  ): Promise<void> {
    const { popup, password, probeTimeout = 5_000 } = input
    const passwordInput = popup
      .locator(
        '[data-testid="fast-vault-password-input"], input[type="password"], input[placeholder*="password" i]'
      )
      .first()

    const isPasswordPromptVisible = await passwordInput
      .isVisible({ timeout: probeTimeout })
      .catch(() => false)

    if (!isPasswordPromptVisible) {
      return
    }

    await passwordInput.fill(password)

    const confirmButton = popup
      .locator('[data-testid="fast-vault-submit"]')
      .or(popup.getByRole('button', { name: /confirm/i }))
      .first()

    await expect(confirmButton).toBeEnabled({ timeout: 5_000 })
    await confirmButton.click()
  }

  async function connectDappWallet(
    input: ConnectDappWalletInput
  ): Promise<string> {
    const { page, context, extensionId } = input
    const connectButton = page.locator('[data-testid="connect-wallet"]')
    await connectButton.click()

    await approveRequiredDappRequest({
      context,
      extensionId,
      requestName: 'eth_requestAccounts',
    })

    const connectResult = page.locator('[data-testid="connect-result"]')
    await expect(
      connectResult,
      'eth_requestAccounts should resolve to a connected EVM account'
    ).toHaveText(connectedAccountPattern, { timeout: 10_000 })

    const resultText = await connectResult.textContent()
    const address = resultText?.match(evmAddressPattern)?.[0]

    if (!address) {
      throw new Error(
        `Connected result did not include an EVM address: ${resultText}`
      )
    }

    return address
  }

  test('window.ethereum injected on test DApp page', async ({ context }) => {
    const page = await context.newPage()

    await page.goto(dappUrl)
    await page.waitForLoadState('domcontentloaded')

    // Wait for provider injection
    await page.waitForTimeout(2000)

    // Check window.ethereum exists
    const hasEthereum = await page.evaluate(() => !!window.ethereum)
    expect(hasEthereum).toBe(true)

    // Check it has expected methods
    const hasRequestMethod = await page.evaluate(
      () => typeof window.ethereum?.request === 'function'
    )
    expect(hasRequestMethod).toBe(true)

    await expect
      .poll(() => page.evaluate(() => window.ethereum?.isVultiConnect === true))
      .toBe(true)

    await page.close()
  })

  test('eth_requestAccounts - popup opens - approve - address returned', async ({
    context,
    extensionId,
  }) => {
    test.skip(
      !getVaultConfigFromEnv(),
      'Requires the designated TEST_VAULT_PATH and TEST_VAULT_PASSWORD fixture'
    )
    await ensureDappProviderVault({ context, extensionId })

    const page = await context.newPage()

    try {
      await page.goto(dappUrl)
      await page.waitForLoadState('domcontentloaded')
      await page.waitForFunction(() => !!window.ethereum, null, {
        timeout: 10000,
      })

      await connectDappWallet({ page, context, extensionId })
    } finally {
      await page.close()
    }
  })

  test('personal_sign - popup shows message - approve - signature returned', async ({
    context,
    extensionId,
  }) => {
    test.skip(
      !getVaultConfigFromEnv(),
      'Requires the designated TEST_VAULT_PATH and TEST_VAULT_PASSWORD fixture'
    )
    const config = await ensureDappProviderVault({ context, extensionId })

    const page = await context.newPage()

    try {
      await page.goto(dappUrl)
      await page.waitForLoadState('domcontentloaded')
      await page.waitForFunction(() => !!window.ethereum, null, {
        timeout: 10000,
      })

      await connectDappWallet({ page, context, extensionId })

      const signButton = page.locator('[data-testid="sign-message"]')
      await expect(
        signButton,
        'personal_sign requires the DApp wallet connection to enable signing'
      ).toBeEnabled({ timeout: 10_000 })
      await signButton.click()

      const approval = await approveRequiredDappRequest({
        context,
        extensionId,
        requestName: 'personal_sign',
        waitForClose: false,
      })
      await submitFastVaultPasswordIfPrompted({
        popup: approval.page,
        password: config.password,
      })

      const signResult = page.locator('[data-testid="sign-result"]')
      await expect(
        signResult,
        'personal_sign should resolve to an EVM signature'
      ).toHaveText(signaturePattern, { timeout: 120_000 })
    } finally {
      await page.close()
    }
  })

  test('wallet_switchEthereumChain - chainChanged event fires', async ({
    context,
    extensionId,
  }) => {
    test.skip(
      !getVaultConfigFromEnv(),
      'Requires the designated TEST_VAULT_PATH and TEST_VAULT_PASSWORD fixture'
    )
    await ensureDappProviderVault({ context, extensionId })

    const page = await context.newPage()

    try {
      await page.goto(dappUrl)
      await page.waitForLoadState('domcontentloaded')
      await page.waitForFunction(() => !!window.ethereum, null, {
        timeout: 10000,
      })
      await connectDappWallet({ page, context, extensionId })

      const switchButton = page.locator('[data-testid="switch-chain"]')
      await expect(switchButton).toBeEnabled()
      const chainSelect = page.locator('#chain-select')
      await chainSelect.selectOption('0x89')
      await switchButton.click()

      const popup = await waitForApprovalPopup({ context, extensionId })
      if (popup && !popup.isClosed()) {
        const approval = new DAppApproval(popup, extensionId)
        await approval.waitForView(5000)
        await approval.approve()
      }

      const switchResult = page.locator('[data-testid="switch-result"]')
      await expect(switchResult).toContainText(/0x89/i)
      const eventsLog = page.locator('[data-testid="events-log"]')
      await expect(eventsLog).toContainText('chainChanged')
    } finally {
      await page.close()
    }
  })

  test('reject connection returns UserRejectedRequest error', async ({
    context,
    extensionId,
  }) => {
    test.skip(
      !getVaultConfigFromEnv(),
      'Requires the designated TEST_VAULT_PATH and TEST_VAULT_PASSWORD fixture'
    )
    await ensureDappProviderVault({ context, extensionId })

    const page = await context.newPage()

    try {
      await page.goto(dappUrl)
      await page.waitForLoadState('domcontentloaded')
      await page.waitForFunction(() => !!window.ethereum, null, {
        timeout: 10000,
      })

      const connectButton = page.locator('[data-testid="connect-wallet"]')
      await connectButton.click()

      const popup = await waitForApprovalPopup({ context, extensionId })
      if (!popup || popup.isClosed()) {
        throw new Error(
          'eth_requestAccounts rejection did not open an approval popup'
        )
      }

      const approval = new DAppApproval(popup, extensionId)
      await approval.waitForView(10_000)
      await approval.reject()
      await approval.waitForClose()

      const connectResult = page.locator('[data-testid="connect-result"]')
      await expect(connectResult).toContainText(/4001|reject|denied|cancel/i)
    } finally {
      await page.close()
    }
  })

  test('window.vultisig and its Solana provider are injected', async ({
    context,
  }) => {
    const page = await context.newPage()

    await page.goto(dappUrl)
    await page.waitForLoadState('domcontentloaded')

    await expect
      .poll(() =>
        page.evaluate(() => ({
          ethereum: !!window.ethereum,
          vultisig: !!window.vultisig,
          vultisigSolana: !!window.vultisig?.solana,
        }))
      )
      .toEqual({
        ethereum: true,
        vultisig: true,
        vultisigSolana: true,
      })

    await page.close()
  })

  test('window.vultisig delegates the EIP-1193 surface without losing cross-chain keys', async ({
    context,
  }) => {
    const page = await context.newPage()

    try {
      await page.goto(dappUrl)
      await page.waitForLoadState('domcontentloaded')
      await page.waitForFunction(() => !!window.vultisig, null, {
        timeout: 10000,
      })

      const delegatedMethods = [
        'request',
        'on',
        'removeListener',
        'isConnected',
      ]

      const result = await page.evaluate(async delegated => {
        const keys = Object.keys(window.vultisig)
        return {
          delegateTypes: delegated.map(
            method => typeof Reflect.get(window.vultisig, method)
          ),
          // Legacy path and canonical provider must answer identically
          chainIdViaContainer: await window.vultisig.request({
            method: 'eth_chainId',
          }),
          chainIdViaProvider: await window.vultisig.ethereum.request({
            method: 'eth_chainId',
          }),
          isConnectedMatchesProvider:
            window.vultisig.isConnected() ===
            window.vultisig.ethereum.isConnected(),
          enumerableDelegates: keys.filter(key => delegated.includes(key)),
          crossChainKeysIntact: [
            'ethereum',
            'solana',
            'thorchain',
            'xrpl',
            'getVault',
            'getVaults',
          ].every(key => keys.includes(key)),
        }
      }, delegatedMethods)

      expect(result.delegateTypes).toEqual([
        'function',
        'function',
        'function',
        'function',
      ])
      expect(result.chainIdViaContainer).toBe(result.chainIdViaProvider)
      expect(result.isConnectedMatchesProvider).toBe(true)
      expect(result.enumerableDelegates).toEqual([])
      expect(result.crossChainKeysIntact).toBe(true)
    } finally {
      await page.close()
    }
  })

  /**
   * Release gate for the dApp raw-tx signSolana splice path — exercised by
   * nothing else in the suite (in-app send/swap compile through
   * TransactionCompiler instead). sdk#2145 shipped in v1.0.69+ precisely
   * because no test drove a raw dApp tx end to end. Sign-only: needs the
   * vault's Solana key but no SOL.
   */
  test('solana signTransaction returns the signed raw tx (dApp splice path, sdk#2145 gate)', async ({
    context,
    extensionId,
  }) => {
    test.skip(
      !getVaultConfigFromEnv(),
      'Requires the designated TEST_VAULT_PATH and TEST_VAULT_PASSWORD fixture'
    )
    test.setTimeout(480_000)
    const config = await ensureDappProviderVault({ context, extensionId })

    const addresses = await getVaultAddresses(context)
    const solanaAddress = Object.entries(addresses).find(
      ([chain]) => chain.toLowerCase() === 'solana'
    )?.[1]
    if (!solanaAddress) {
      throw new Error(
        'Test vault has no Solana address in chrome.storage — enable the Solana chain on the test vault'
      )
    }

    const recentBlockhash = await fetchSolanaBlockhash()
    const payer = new PublicKey(solanaAddress)
    const message = new TransactionMessage({
      payerKey: payer,
      recentBlockhash,
      instructions: [
        SystemProgram.transfer({
          fromPubkey: payer,
          toPubkey: payer,
          lamports: 1,
        }),
      ],
    }).compileToV0Message()
    const unsigned = new VersionedTransaction(message)
    const unsignedBase64 = Buffer.from(unsigned.serialize()).toString('base64')

    const page = await context.newPage()

    try {
      await page.goto(dappUrl)
      await page.waitForLoadState('domcontentloaded')
      await page.waitForFunction(
        () => !!(window.vultisig?.solana || window.phantom?.solana),
        null,
        { timeout: 10000 }
      )

      await page.locator('[data-testid="solana-tx-input"]').fill(unsignedBase64)
      await page.locator('[data-testid="solana-sign-tx"]').click()

      // Two sequential popups: Solana account connect, then the sendTx
      // verify/sign flow (which may be multi-step and ask for the fast-vault
      // password). Walk primary actions until the page reports a result.
      const solanaResult = page.locator('[data-testid="solana-sign-result"]')
      await driveApprovalPopupsUntilResult({
        context,
        extensionId,
        result: solanaResult,
        password: config.password,
      })

      // Fail fast on a settled error — otherwise the expect below polls a
      // string that will never change until the test timeout swallows it.
      const settledResult = (await solanaResult.textContent()) ?? ''
      if (settledResult.startsWith('Error:')) {
        throw new Error(
          `dApp signTransaction rejected (signSolana path, see sdk#2145): ${settledResult}`
        )
      }

      await expect(
        solanaResult,
        'dApp signTransaction must return signed bytes — a popup error here ' +
          'means the signSolana compile/hash path is broken (see sdk#2145)'
      ).toHaveText(/^SolanaSigned: /, { timeout: 300_000 })

      const signedBase64 = (await solanaResult.textContent())!.replace(
        'SolanaSigned: ',
        ''
      )
      const signed = VersionedTransaction.deserialize(
        new Uint8Array(Buffer.from(signedBase64, 'base64'))
      )

      const signature = signed.signatures[0]
      expect(
        signature,
        'signed tx must carry a fee-payer signature'
      ).toBeDefined()
      expect(
        signature.some(byte => byte !== 0),
        'fee-payer signature must not be all zeroes'
      ).toBe(true)

      // The splice must not disturb the message: same bytes the dApp submitted.
      expect(Buffer.from(signed.message.serialize()).toString('base64')).toBe(
        Buffer.from(message.serialize()).toString('base64')
      )

      // And the signature must actually verify over those bytes.
      expect(
        ed25519.verify(signature, signed.message.serialize(), payer.toBytes()),
        'ed25519 signature must verify against the vault Solana pubkey'
      ).toBe(true)
    } finally {
      await page.close()
    }
  })

  const solanaRpcEndpoints = [
    'https://api.mainnet-beta.solana.com',
    'https://solana-rpc.publicnode.com',
  ]

  async function fetchSolanaBlockhash(): Promise<string> {
    for (const endpoint of solanaRpcEndpoints) {
      try {
        const connection = new Connection(endpoint)
        const { blockhash } = await connection.getLatestBlockhash('finalized')
        if (blockhash) return blockhash
      } catch {
        // try the next endpoint
      }
    }
    throw new Error(
      'HARNESS: no Solana RPC endpoint reachable for getLatestBlockhash — not an app defect'
    )
  }

  type DriveApprovalPopupsInput = ExtensionContextInput & {
    result: ReturnType<Page['locator']>
    password: string
  }

  async function driveApprovalPopupsUntilResult({
    context,
    extensionId,
    result,
    password,
  }: DriveApprovalPopupsInput): Promise<void> {
    const deadline = Date.now() + 240_000

    while (Date.now() < deadline) {
      const resultText = (await result.textContent().catch(() => '')) ?? ''
      if (
        resultText.startsWith('SolanaSigned:') ||
        resultText.startsWith('Error:')
      ) {
        return
      }

      const popup = context
        .pages()
        .find(
          (p: Page) =>
            !p.isClosed() &&
            p.url().includes(`chrome-extension://${extensionId}`)
        )

      if (!popup) {
        await new Promise(resolve => setTimeout(resolve, 1_000))
        continue
      }

      // Short probe: the loop re-polls every ~1.5s, so a slow password prompt
      // is caught on a later iteration without burning the drive deadline.
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
        `[sdk#2145 gate] popup=${popup.url().slice(-40)} buttons=${JSON.stringify(buttonTexts)} result=${JSON.stringify(resultText)}`
      )

      // A "Try Again" screen means the keysign errored — surface the popup's
      // own error text as the failure instead of spinning until timeout. The
      // raw error hides behind the "Show exact error" card, so open it first.
      if (buttonTexts.some(text => /try again/i.test(text))) {
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
      if (canClick) {
        await primaryAction.click().catch(() => {})
      }

      await new Promise(resolve => setTimeout(resolve, 1_500))
    }

    throw new Error(
      'Timed out driving the Solana dApp approval popups — no sign result surfaced'
    )
  }
})
