import path from 'path'
import { fileURLToPath } from 'url'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))

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

const isExtensionArtifactDirectory = (
  value: string
): value is keyof typeof artifactConfig =>
  Object.prototype.hasOwnProperty.call(artifactConfig, value)

if (!isExtensionArtifactDirectory(requestedArtifact)) {
  throw new Error(
    `Unsupported VULTISIG_EXTENSION_ARTIFACT "${requestedArtifact}". Expected "dist" or "dist-station".`
  )
}

export const extensionArtifactDirectory = requestedArtifact
export const expectedExtensionArtifact =
  artifactConfig[extensionArtifactDirectory]
export const extensionPath = path.resolve(
  currentDirectory,
  '../..',
  extensionArtifactDirectory
)
