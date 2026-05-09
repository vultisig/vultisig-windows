import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const manifestPath = path.resolve(currentDir, '../dist/manifest.json')
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))

manifest.author = 'Vultisig <info@vultisig.com>'

const backgroundServiceWorker = manifest.background?.service_worker
if (!backgroundServiceWorker) {
  throw new Error('Firefox build expected background.service_worker')
}

manifest.background = {
  scripts: [backgroundServiceWorker],
  type: manifest.background.type,
}

manifest.permissions = manifest.permissions.filter(
  permission => !['sidePanel', 'windows'].includes(permission)
)

delete manifest.version_name
delete manifest.side_panel

manifest.content_security_policy = {
  extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'",
}

manifest.web_accessible_resources = manifest.web_accessible_resources.map(
  entry =>
    entry.resources.includes('inpage.js')
      ? {
          resources: [...entry.resources, 'assets/*.js'],
          matches: entry.matches,
        }
      : { resources: entry.resources, matches: entry.matches }
)

manifest.browser_specific_settings = {
  gecko: {
    id: 'vultisig-extension@vultisig.com',
    strict_min_version: '142.0',
    data_collection_permissions: {
      required: ['financialAndPaymentInfo', 'websiteActivity'],
    },
  },
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
