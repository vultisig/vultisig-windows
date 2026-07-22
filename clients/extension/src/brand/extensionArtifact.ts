import {
  ExtensionBrandConfig,
  ExtensionProductBrand,
} from './extensionBrandConfig'

const extensionArtifactDirectoryByBrand: Record<ExtensionProductBrand, string> =
  {
    vultisig: 'dist',
    station: 'dist-station',
  }

export const getExtensionArtifactDirectoryName = (
  brand: ExtensionProductBrand
) => extensionArtifactDirectoryByBrand[brand]

type ExtensionArtifactReceipt = {
  schemaVersion: 1
  brand: ExtensionProductBrand
  artifactDirectory: string
  manifestName: string
}

export const getExtensionArtifactReceipt = ({
  config,
  artifactDirectory,
}: {
  config: ExtensionBrandConfig
  artifactDirectory: string
}): ExtensionArtifactReceipt => ({
  schemaVersion: 1,
  brand: config.brand,
  artifactDirectory,
  manifestName: config.manifest.name,
})
