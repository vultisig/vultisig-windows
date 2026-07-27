import { expect, test } from '../fixtures/extension-loader'
import {
  getVaultConfigFromEnv,
  importVaultViaUI,
} from '../helpers/vault-import'

test('vault search keeps the lens stable through focus, typing, and blur', async ({
  context,
  extensionId,
}) => {
  const config = getVaultConfigFromEnv()

  if (!config) {
    test.skip(true, 'No vault configuration')
    return
  }

  const page = await context.newPage()
  const imported = await importVaultViaUI(page, { ...config, extensionId })
  expect(imported).toBe(true)

  const prompt = page.locator('[role="dialog"][aria-modal="true"]')
  if (await prompt.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.keyboard.press('Escape')
    await expect(prompt).toBeHidden()
  }

  await page.locator('[data-testid="vault-chain-search-button"]').click()

  const input = page.locator('input[type="text"]:visible').first()
  const searchField = input.locator('xpath=..')
  const lens = searchField.locator('svg').first()

  await expect(input).toBeFocused()
  await expect(lens).toBeVisible()

  const getLensOffset = async () => {
    const [fieldBox, lensBox] = await Promise.all([
      searchField.boundingBox(),
      lens.boundingBox(),
    ])
    expect(fieldBox).not.toBeNull()
    expect(lensBox).not.toBeNull()

    return {
      left: lensBox!.x - fieldBox!.x,
      top: lensBox!.y - fieldBox!.y,
    }
  }

  const initialLensOffset = await getLensOffset()

  await page.waitForTimeout(500)
  await input.pressSequentially('eth', { delay: 200 })
  await expect(input).toHaveValue('eth')
  await expect(lens).toBeVisible()
  expect(await getLensOffset()).toEqual(initialLensOffset)
  await page.waitForTimeout(500)

  await input.evaluate(element => element.blur())
  await expect(input).not.toBeFocused()
  await expect(lens).toBeVisible()
  expect(await getLensOffset()).toEqual(initialLensOffset)
  await page.waitForTimeout(500)

  for (let iteration = 0; iteration < 3; iteration += 1) {
    await input.focus()
    await expect(lens).toBeVisible()
    await page.waitForTimeout(350)
    await input.evaluate(element => element.blur())
    await expect(lens).toBeVisible()
    await page.waitForTimeout(350)
  }

  const artifactDir = process.env.EXTENSION_QA_ARTIFACT_DIR
  if (artifactDir) {
    await page.waitForTimeout(500)
    await page.screenshot({
      animations: 'disabled',
      path: `${artifactDir}/extension-search-filled-blurred.png`,
    })
    await input.focus()
    await page.waitForTimeout(500)
    await searchField.screenshot({
      animations: 'disabled',
      path: `${artifactDir}/extension-search-filled-focused.png`,
    })
  }

  await page.close()
})
