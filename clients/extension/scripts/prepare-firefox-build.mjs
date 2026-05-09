import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const manifestPath = path.resolve(currentDir, '../dist/manifest.json')
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))

const backgroundServiceWorker = manifest.background?.service_worker
if (!backgroundServiceWorker) {
  throw new Error('Firefox build expected background.service_worker')
}

manifest.background = {
  scripts: [backgroundServiceWorker],
  type: manifest.background.type,
}

manifest.permissions = manifest.permissions.filter(
  permission => permission !== 'sidePanel'
)

delete manifest.side_panel

manifest.browser_specific_settings = {
  gecko: {
    id: 'vultisig-extension@vultisig.com',
    strict_min_version: '121.0',
    data_collection_permissions: {
      required: ['financialAndPaymentInfo', 'websiteActivity'],
    },
  },
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
