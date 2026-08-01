/**
 * Seedphrase Import E2E Tests
 *
 * Uses a public BIP39 test vector with no production value. These tests prove
 * the real extension navigation and validation states without completing a
 * network-backed Fast Vault keygen.
 */

import { expect, test } from '../fixtures/extension-loader'
import { OnboardingPage } from '../page-objects/OnboardingPage.po'
import { SeedphraseWizard } from '../page-objects/SeedphraseWizard.po'

const VALID_12_WORD_MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
const INVALID_MNEMONIC =
  'invalid words that are not a real mnemonic phrase at all testing'

const openSeedphraseInput = async ({
  onboarding,
  seedphraseWizard,
}: {
  onboarding: OnboardingPage
  seedphraseWizard: SeedphraseWizard
}) => {
  await onboarding.goto()
  await onboarding.waitForView()
  await onboarding.completeOnboarding()

  await expect(onboarding.importVaultButton).toBeVisible()
  await onboarding.importVault()

  const importSeedphrase = onboarding.page.getByRole('button', {
    name: /import seedphrase/i,
  })
  await expect(importSeedphrase).toBeVisible()
  await importSeedphrase.click()

  const introGetStarted = onboarding.page.getByRole('button', {
    name: /get started/i,
  })
  await expect(introGetStarted).toBeVisible({ timeout: 10_000 })
  await introGetStarted.click()
  await seedphraseWizard.waitForView()
}

test.describe('Seedphrase Import', () => {
  test('valid 12-word mnemonic starts chain discovery', async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage()
    const onboarding = new OnboardingPage(page, extensionId)
    const seedphraseWizard = new SeedphraseWizard(page, extensionId)

    await openSeedphraseInput({ onboarding, seedphraseWizard })
    await seedphraseWizard.enterSeedphrase(VALID_12_WORD_MNEMONIC)

    await expect(seedphraseWizard.validationError).toBeHidden()
    await expect(seedphraseWizard.continueButton).toBeEnabled()
    await seedphraseWizard.continue()

    await expect(
      page.getByText(
        /scanning for chains|no active chains found|we found \d+ active chains/i
      )
    ).toBeVisible({ timeout: 60_000 })

    await page.close()
  })

  test('invalid mnemonic shows validation error and blocks import', async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage()
    const onboarding = new OnboardingPage(page, extensionId)
    const seedphraseWizard = new SeedphraseWizard(page, extensionId)

    await openSeedphraseInput({ onboarding, seedphraseWizard })
    await seedphraseWizard.enterSeedphrase(INVALID_MNEMONIC)

    await expect(seedphraseWizard.validationError).toContainText(
      /12 or 24|not correct/i
    )
    await expect(seedphraseWizard.continueButton).toBeDisabled()

    await page.close()
  })

  test('manual chain selection continues to imported-vault setup', async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage()
    const onboarding = new OnboardingPage(page, extensionId)
    const seedphraseWizard = new SeedphraseWizard(page, extensionId)

    await openSeedphraseInput({ onboarding, seedphraseWizard })
    await seedphraseWizard.enterSeedphrase(VALID_12_WORD_MNEMONIC)
    await seedphraseWizard.continue()

    const selectManually = page.getByRole('button', {
      name: /select chains manually/i,
    })
    await expect(selectManually).toBeVisible()
    await selectManually.click()

    await expect(page.getByText('Ethereum', { exact: true })).toBeVisible()
    await page.getByText('Ethereum', { exact: true }).click()

    const nextButton = page.getByRole('button', { name: 'Next' })
    await expect(nextButton).toBeEnabled()
    await nextButton.click()

    await expect(page.locator('canvas').first()).toBeVisible()
    await expect(
      page.getByRole('button', { name: /get started/i }).first()
    ).toBeVisible()

    await page.close()
  })
})
