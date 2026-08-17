/**
 * Passcode Lock Layering E2E
 *
 * Regression for #4596: the passcode gate rendered inside `#root`, which
 * `isolation: isolate` confines, while modals, sheets and toasts portal out to
 * `document.body`. A modal open when auto-lock fired stayed painted over the
 * gate, still clickable, and its `FocusLock` held the keyboard so the passcode
 * could not even be typed.
 *
 * Only a real browser can answer "which layer owns this pixel", which is why
 * this is an e2e test. `topLayerTextAt` is the assertion that matters —
 * asserting the gate is merely *visible* would have passed before the fix too,
 * because the gate was always visible, just underneath.
 *
 * Requires a configured test vault (`tests/e2e/.env`); enabling the passcode
 * encrypts real keyshares. Skips when unconfigured.
 *
 * Locator debt: the Security row, the enable switch, the interval option and
 * every back button are matched by text or DOM position because none of them
 * carry a `data-testid`, and `Switch`, `ListItem` and `PageHeaderBackButton`
 * expose no ARIA role or accessible name. Adding `security-settings-link`,
 * `passcode-enable-switch`, `back-button` and `passcode-gate` testids would
 * make this file considerably less fragile.
 */

import type { Locator, Page } from '@playwright/test'

import { expect, test } from '../fixtures/extension-loader'
import {
  ensureVaultExists,
  getVaultConfigFromEnv,
} from '../helpers/vault-import'
import { VaultPage } from '../page-objects/VaultPage.po'

const passcode = '13579'
const autoLockMinutes = 1
// Exact `en.ts` strings. `getByText` matches case-insensitively, but
// `topLayerTextAt` compares raw textContent, so the casing has to be right.
const modalMarker = 'Select chain'
const gateMarker = 'App Locked'

/**
 * Returns the text of the top-level layer that owns the centre of the viewport.
 *
 * Everything portalled out of `#root` — modals, sheets, toasts and the gate —
 * lands as a direct child of `<body>`, so `closest('body > *')` on the hit
 * element names the layer that actually paints there. This is the browser's own
 * hit test, the same one that decides where a click lands.
 */
const topLayerTextAt = (page: Page) =>
  page.evaluate(() => {
    const el = document.elementFromPoint(
      Math.round(window.innerWidth / 2),
      Math.round(window.innerHeight / 2)
    )

    return el?.closest('body > *')?.textContent ?? ''
  })

/**
 * Reports whether a control can actually be clicked. A trial click runs every
 * actionability check, hit-testing included, without dispatching the click — so
 * a control buried under an overlay resolves to `covered`.
 */
const clickability = async (page: Page, text: string) =>
  page
    .getByText(text)
    .first()
    .click({ trial: true, timeout: 2_000 })
    .then(() => 'clickable' as const)
    .catch(() => 'covered' as const)

/**
 * Clicks the header back button and waits for the destination to prove itself.
 *
 * `PageHeaderBackButton` is an unlabelled icon button, so it can only be
 * addressed by position: the page header renders before the content, making it
 * the first button in the document. Waiting on `until` keeps a mis-click from
 * being discovered several steps later.
 */
const goBack = async (page: Page, until: Locator) => {
  await page.locator('button').first().click()
  await expect(until).toBeVisible()
}

/**
 * Turns the passcode on through the settings UI. The switch is an `Opener`, so
 * flipping it reveals the two passcode fields and the submit button.
 */
const enablePasscode = async (page: Page) => {
  const securityText = page.getByText('Security', { exact: true })

  // One is the section heading, the other the row that navigates. Asserting the
  // count keeps the nth() below from silently pointing at the wrong thing.
  await expect(securityText).toHaveCount(2)
  await securityText.nth(1).click()

  await page.getByText('OFF', { exact: true }).first().click()

  // Two PasscodeInputs, each a row of five single-character boxes that advance
  // focus on input — so typing five characters fills one row.
  const digitBoxes = page.locator('input[type="password"]')
  await expect(digitBoxes).toHaveCount(10)

  await digitBoxes.first().click()
  await page.keyboard.type(passcode)
  await digitBoxes.nth(5).click()
  await page.keyboard.type(passcode)

  await page.getByRole('button', { name: /set passcode/i }).click()

  // Encrypting the keyshares takes a moment. The switch flipping to ON is what
  // says it landed; ChangePasscode keeps its fields inside a closed modal.
  await expect(page.getByText('ON', { exact: true })).toBeVisible({
    timeout: 30_000,
  })
}

/**
 * Picks the shortest auto-lock interval. The Lock Time row only appears in
 * settings once the passcode is on.
 */
const setAutoLock = async (page: Page) => {
  await page.getByText('Lock Time', { exact: true }).first().click()

  const option = page.getByText(`${autoLockMinutes} minute`, { exact: true })
  await expect(option).toBeVisible()
  await option.click()
}

/**
 * Drives the inactivity timer instead of idling for a real minute — there is no
 * manual lock action, the timer is the only way in.
 *
 * The clock is installed only once the app is up, so boot timers (splash,
 * queries, animations) keep running on the real clock where they are far less
 * brittle. Any interaction reschedules the auto-lock timeout, so the mouse move
 * is what moves it onto the fake clock for `fastForward` to fire.
 */
const lockByInactivity = async (page: Page) => {
  await page.clock.install()
  await page.mouse.move(5, 5)

  // The reschedule lands in a React effect, a tick after the event. Jumping the
  // clock before it commits would schedule the timeout past the jump, where it
  // never fires. `waitForTimeout` runs driver-side, so the faked page clock does
  // not govern it.
  await page.waitForTimeout(250)

  // Overshoot rather than landing on the interval exactly, so the test does not
  // depend on the lock staying a `setTimeout` rather than a deadline check.
  await page.clock.fastForward(`0${autoLockMinutes}:10`)
}

test.describe('Passcode lock layering', () => {
  test.beforeEach(async ({ context, extensionId }) => {
    const config = getVaultConfigFromEnv()

    if (!config) {
      test.skip(true, 'No test vault configured in tests/e2e/.env')
      return
    }

    // It reports failure by returning false rather than throwing, so without
    // this the run dies later at a locator timeout that hides the real cause.
    const imported = await ensureVaultExists(
      context,
      extensionId,
      config.vaultPath,
      config.password
    )

    expect(imported, 'test vault could not be imported').toBe(true)
  })

  test('the gate covers an open modal, takes the keyboard, and leaves it open', async ({
    context,
    extensionId,
  }) => {
    test.slow()

    const page = await context.newPage()
    const vaultPage = new VaultPage(page, extensionId)

    try {
      await vaultPage.goto()
      await vaultPage.waitForView()
      await vaultPage.dismissPromptSheets()

      const settingsMarker = page.getByText('Security', { exact: true }).first()

      // The page object's settingsButton falls back to "last button with an
      // svg", which lands on the wrong control. The header carries a testid.
      await page.locator('[data-testid="settings-button"]').click()
      await expect(settingsMarker).toBeVisible()

      await enablePasscode(page)
      await goBack(page, settingsMarker)

      await setAutoLock(page)
      await goBack(page, settingsMarker)
      await goBack(page, vaultPage.receiveButton)

      await vaultPage.receiveButton.click()
      await expect(page.getByText(modalMarker)).toBeVisible()

      // Baseline: before locking, the modal is what the centre of the screen
      // belongs to. Without this the later assertion could pass for the wrong
      // reason — e.g. the modal never opened at all.
      expect(await topLayerTextAt(page)).toContain(modalMarker)
      expect(await clickability(page, modalMarker)).toBe('clickable')

      await lockByInactivity(page)

      await expect(page.getByText(gateMarker)).toBeVisible()

      // The point of the bug: the modal is still mounted, but it must not own a
      // single pixel or receive a single click.
      const topLayer = await topLayerTextAt(page)
      expect(topLayer).toContain(gateMarker)
      expect(topLayer).not.toContain(modalMarker)

      expect(await clickability(page, modalMarker)).toBe('covered')

      // No click first: if a modal's FocusLock still held the keyboard these
      // keystrokes would go nowhere and the gate would stay up.
      await page.keyboard.type(passcode)
      await expect(page.getByText(gateMarker)).toBeHidden({ timeout: 15_000 })

      // Unlocking restores what the user was doing rather than discarding it.
      await expect(page.getByText(modalMarker)).toBeVisible()
    } finally {
      await page.close()
    }
  })
})
