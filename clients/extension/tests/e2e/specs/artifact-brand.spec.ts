import { expect, test } from '../fixtures/extension.fixture'
import { expectedExtensionArtifact } from '../extension-path'

test('loads the selected extension artifact with its expected brand', async ({
  extensionPage,
}) => {
  const runtimeManifestName = await extensionPage.evaluate(
    () => globalThis.chrome.runtime.getManifest().name
  )

  expect(runtimeManifestName).toBe(expectedExtensionArtifact.manifestName)
  await expect(
    extensionPage.getByText(expectedExtensionArtifact.productName, {
      exact: true,
    })
  ).toBeVisible()
  await expect(
    extensionPage.getByRole('button', { name: /^Import/ })
  ).toBeVisible()
})
