import { access, copyFile, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { Plugin } from 'vite'

import { getExtensionArtifactReceipt } from './extensionArtifact'
import { ExtensionBrandConfig } from './extensionBrandConfig'
import {
  applyExtensionBrandToHtml,
  applyExtensionBrandToManifest,
  ExtensionManifest,
} from './manifest'

const iconNames = [
  'icon16.png',
  'icon32.png',
  'icon48.png',
  'icon64.png',
  'icon128.png',
]

type ExtensionBrandVitePluginInput = {
  config: ExtensionBrandConfig
  distDir: string
  extensionDir: string
}

const pathExists = async (targetPath: string) => {
  try {
    await access(targetPath)
    return true
  } catch {
    return false
  }
}

const copyStationIcons = async (extensionDir: string, distDir: string) => {
  const stationAssetDir = path.resolve(extensionDir, 'public/brand/station')

  await Promise.all(
    iconNames.map(fileName =>
      copyFile(
        path.resolve(stationAssetDir, fileName),
        path.resolve(distDir, fileName)
      )
    )
  )
}

export const extensionBrandVitePlugin = ({
  config,
  distDir,
  extensionDir,
}: ExtensionBrandVitePluginInput): Plugin => ({
  name: 'extension-brand',
  transformIndexHtml: {
    order: 'post',
    handler: (html, context) =>
      applyExtensionBrandToHtml(
        html,
        context.path.endsWith('/popup.html')
          ? config.popupTitle
          : config.htmlTitle
      ),
  },
  closeBundle: async () => {
    const manifestPath = path.resolve(distDir, 'manifest.json')

    if (!(await pathExists(manifestPath))) {
      return
    }

    const manifestJson = await readFile(manifestPath, 'utf8')
    const manifest: ExtensionManifest = JSON.parse(manifestJson)
    const brandedManifest = applyExtensionBrandToManifest(manifest, config)

    await writeFile(
      manifestPath,
      `${JSON.stringify(brandedManifest, null, 2)}\n`
    )

    const artifactDirectory = path.relative(extensionDir, distDir)
    const artifactReceipt = getExtensionArtifactReceipt({
      config,
      artifactDirectory,
    })
    await writeFile(
      path.resolve(distDir, 'extension-artifact.json'),
      `${JSON.stringify(artifactReceipt, null, 2)}\n`
    )

    if (config.brand === 'station') {
      await copyStationIcons(extensionDir, distDir)
    }
  },
})
