import { ExtensionBrandConfig } from './extensionBrandConfig'

export type ExtensionManifest = {
  action?: {
    default_icon?: Record<string, string> | string
  }
  author?: {
    email?: string
    name?: string
    url?: string
  }
  description?: string
  icons?: Record<string, string>
  name?: string
}

export const applyExtensionBrandToManifest = (
  manifest: ExtensionManifest,
  config: ExtensionBrandConfig
): ExtensionManifest => ({
  ...manifest,
  author: config.manifest.author,
  description: config.manifest.description,
  name: config.manifest.name,
})

export const applyExtensionBrandToHtml = (html: string, title: string) =>
  html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
