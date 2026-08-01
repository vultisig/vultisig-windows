import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const expectedByBrand = {
  vultisig: {
    manifestName: 'Vultisig Extension',
    manifestDescription:
      'Vultisig Extension integrates Vultisig into web applications, enabling users to securely sign blockchain transactions.',
    providerName: 'Vultisig',
    providerRdns: 'me.vultisig',
    walletIdentifier: 'vultisig',
  },
  station: {
    manifestName: 'Station Wallet',
    manifestDescription:
      'Station is a web application to interact with Terra Core and other supported chains.',
    providerName: 'Station Wallet',
    providerRdns: 'money.station',
    walletIdentifier: 'station',
  },
}

const brand = process.argv[2] ?? 'vultisig'
const expected = expectedByBrand[brand]

if (!expected) {
  throw new Error(`Unknown extension brand assertion target: ${brand}`)
}

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const artifactDirectory = brand === 'station' ? 'dist-station' : 'dist'
const distDir = path.resolve(currentDir, '..', artifactDirectory)
const manifestPath = path.resolve(distDir, 'manifest.json')
const artifactReceiptPath = path.resolve(distDir, 'extension-artifact.json')
const inpagePath = path.resolve(distDir, 'inpage.js')
const assetsDir = path.resolve(distDir, 'assets')

const readInpageAssetChunks = async () => {
  let entries = []

  try {
    entries = await readdir(assetsDir, { withFileTypes: true })
  } catch {
    return ''
  }

  const inpageAssetPaths = entries
    .filter(
      entry =>
        entry.isFile() &&
        entry.name.endsWith('.js') &&
        entry.name.includes('inpage')
    )
    .map(entry => path.resolve(assetsDir, entry.name))

  const sources = await Promise.all(
    inpageAssetPaths.map(filePath => readFile(filePath, 'utf8'))
  )

  return sources.join('\n')
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
const artifactReceipt = JSON.parse(await readFile(artifactReceiptPath, 'utf8'))
const inpage = [
  await readFile(inpagePath, 'utf8'),
  await readInpageAssetChunks(),
]
  .filter(Boolean)
  .join('\n')

const assertEqual = (actual, expectedValue, label) => {
  if (actual !== expectedValue) {
    throw new Error(
      `${label} mismatch. Expected "${expectedValue}", received "${actual}".`
    )
  }
}

const assertIncludes = (source, expectedValue, label) => {
  if (!source.includes(expectedValue)) {
    throw new Error(`${label} did not include "${expectedValue}".`)
  }
}

assertEqual(manifest.name, expected.manifestName, 'manifest.name')
assertEqual(
  manifest.description,
  expected.manifestDescription,
  'manifest.description'
)
assertIncludes(inpage, expected.providerName, 'inpage provider name')
assertIncludes(inpage, expected.providerRdns, 'inpage provider rdns')
assertIncludes(
  inpage,
  expected.walletIdentifier,
  'Station-compatible wallet identifier'
)
assertEqual(artifactReceipt.schemaVersion, 1, 'artifact.schemaVersion')
assertEqual(artifactReceipt.brand, brand, 'artifact.brand')
assertEqual(
  artifactReceipt.artifactDirectory,
  artifactDirectory,
  'artifact.artifactDirectory'
)
assertEqual(
  artifactReceipt.manifestName,
  expected.manifestName,
  'artifact.manifestName'
)

console.log(`Extension brand assertion passed for ${brand} at ${distDir}.`)
