import { rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const extensionDir = path.resolve(currentDir, '..')
const artifactDirectoryByBrand = {
  vultisig: 'dist',
  station: 'dist-station',
}
const brand = process.argv[2] ?? 'vultisig'
const artifactDirectory = artifactDirectoryByBrand[brand]

if (!artifactDirectory) {
  throw new Error(
    `Unknown extension artifact brand "${brand}". Expected "vultisig" or "station".`
  )
}

const distPath = path.resolve(extensionDir, artifactDirectory)

await rm(distPath, { force: true, recursive: true })

console.log(`Cleaned ${brand} extension artifact: ${distPath}`)
