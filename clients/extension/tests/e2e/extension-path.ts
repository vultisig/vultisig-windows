import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const artifactConfig = {
  dist: {
    brand: 'vultisig',
    manifestName: 'Vultisig Extension',
    productName: 'Vultisig',
  },
  'dist-station': {
    brand: 'station',
    manifestName: 'Station Wallet',
    productName: 'Station',
  },
} as const

const requestedArtifact = process.env.VULTISIG_EXTENSION_ARTIFACT ?? 'dist'

if (!(requestedArtifact in artifactConfig)) {
  throw new Error(
    `Unsupported VULTISIG_EXTENSION_ARTIFACT "${requestedArtifact}". Expected "dist" or "dist-station".`
  )
}

export const extensionArtifactDirectory =
  requestedArtifact as keyof typeof artifactConfig
export const expectedExtensionArtifact =
  artifactConfig[extensionArtifactDirectory]
export const extensionPath = path.resolve(
  __dirname,
  '../..',
  extensionArtifactDirectory
)
