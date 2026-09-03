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

import { execFileSync } from 'node:child_process'

import { ed25519 } from '@noble/curves/ed25519'
import type { BrowserContext, Page } from '@playwright/test'
import { VersionedTransaction } from '@solana/web3.js'

import {
  startTestDappServer,
  type TestDappServer,
} from '../fixtures/dapp-page.fixture'
import { expect, test } from '../fixtures/extension-loader'
import {
  observeDappAccountRead,
  type ReadinessReceipt,
} from '../helpers/dapp-provider-readiness'
import {
  signSolanaSelfTransferViaDapp,
  submitFastVaultPasswordIfPrompted,
} from '../helpers/solana-dapp-sign'
import {
  ensureVaultExists,
  getVaultConfigFromEnv,
} from '../helpers/vault-import'
import { DAppApproval } from '../page-objects/DAppApproval.po'

// Store DApp server at module level for sharing
let dappServer: TestDappServer | null = null
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

type ConnectDappWalletInput = ExtensionContextInput & {
  page: Page
}

test.describe('DApp Provider', () => {
  test.beforeAll(async () => {
    dappServer = await startTestDappServer()
    dappUrl = dappServer.url
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

  const accountReads: Array<'eth_requestAccounts' | 'xrpl.getAddress'> = [
    'eth_requestAccounts',
    'xrpl.getAddress',
  ]
  for (const requestName of accountReads) {
    test(`${requestName} - grant closure and original account response`, async ({
      context,
      extensionId,
    }) => {
      test.skip(!getVaultConfigFromEnv(), 'Requires the designated test vault')
      test.setTimeout(120_000)
      await ensureDappProviderVault({ context, extensionId })
      const page = await context.newPage()
      let receipt: ReadinessReceipt<unknown> | undefined
      let contextClosed = false
      context.once('close', () => {
        contextClosed = true
      })
      try {
        await page.goto(dappUrl)
        receipt = await observeDappAccountRead({
          sourceOrigin: new URL(dappUrl).origin,
          revision: execFileSync('git', ['rev-parse', 'HEAD'], {
            encoding: 'utf8',
          }).trim(),
          requestName,
          currentOrigin: () => new URL(page.url()).origin,
          waitForInjection: async () => {
            await page.waitForFunction(
              name =>
                name === 'eth_requestAccounts'
                  ? typeof window.ethereum?.request === 'function'
                  : typeof Reflect.get(window.vultisig ?? {}, 'xrpl')
                      ?.getAddress === 'function',
              requestName,
              { timeout: 10_000 }
            )
          },
          request: () =>
            page.evaluate(
              name =>
                name === 'eth_requestAccounts'
                  ? window.ethereum.request({ method: 'eth_requestAccounts' })
                  : Reflect.get(window.vultisig, 'xrpl').getAddress(),
              requestName
            ),
          approveAndWaitForClose: async () => {
            const popup = await waitForApprovalPopup({ context, extensionId })
            if (!popup || popup.isClosed())
              throw new Error('Account read did not open its grant popup')
            const approval = new DAppApproval(popup, extensionId)
            await approval.waitForView(10_000)
            // Verify the actual window closes, not merely hidden controls.
            await Promise.all([
              popup.waitForEvent('close', { timeout: 10_000 }),
              approval.approve(),
            ])
          },
          reload: async () => {
            await page.reload({
              waitUntil: 'domcontentloaded',
              timeout: 10_000,
            })
          },
          recover: true,
        })
        expect(receipt.verdict, JSON.stringify(receipt)).toBe('PASS')
        if (receipt.original.state !== 'resolved')
          throw new Error('Original account call did not resolve')
        if (requestName === 'eth_requestAccounts') {
          expect(receipt.original.value).toEqual([
            expect.stringMatching(/^0x[a-fA-F0-9]{40}$/),
          ])
        } else {
          expect(receipt.original.value).toEqual({
            address: expect.stringMatching(/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/),
          })
        }
      } catch (error) {
        if (receipt) receipt.verdict = 'FAIL'
        throw error
      } finally {
        await page.close()
        await context.close()
        if (receipt)
          await test.info().attach(`${requestName}-readiness`, {
            body: JSON.stringify(
              {
                ...receipt,
                cleanup: {
                  dappPageClosed: page.isClosed(),
                  disposableContextClosed: contextClosed,
                },
              },
              null,
              2
            ),
            contentType: 'application/json',
          })
      }
    })
  }

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

    const { signedBase64, messageBase64, payer } =
      await signSolanaSelfTransferViaDapp({
        context,
        extensionId,
        password: config.password,
        dappUrl,
      })

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
      messageBase64
    )

    // And the signature must actually verify over those bytes.
    expect(
      ed25519.verify(signature, signed.message.serialize(), payer.toBytes()),
      'ed25519 signature must verify against the vault Solana pubkey'
    ).toBe(true)
  })
})
