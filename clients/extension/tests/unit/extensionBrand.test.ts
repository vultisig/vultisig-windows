import { describe, expect, it } from 'vitest'

import {
  extensionBrandConfigs,
  resolveExtensionProductBrand,
} from '@clients/extension/src/brand/extensionBrandConfig'
import {
  applyExtensionBrandToHtml,
  applyExtensionBrandToManifest,
  ExtensionManifest,
} from '@clients/extension/src/brand/manifest'

const baseManifest: ExtensionManifest = {
  name: 'Vultisig Extension',
  description:
    'Vultisig Extension integrates Vultisig into web applications, enabling users to securely sign blockchain transactions.',
  author: {
    name: 'Vultisig',
    email: 'info@vultisig.com',
    url: 'https://vultisig.com',
  },
  icons: {
    '128': 'icon128.png',
  },
}

describe('extension brand config', () => {
  it('defaults to the Vultisig extension brand', () => {
    expect(resolveExtensionProductBrand()).toBe('vultisig')
    expect(resolveExtensionProductBrand('vultisig')).toBe('vultisig')
  })

  it('accepts the Station extension brand selector', () => {
    expect(resolveExtensionProductBrand('station')).toBe('station')
  })

  it('rejects unsupported extension brand selectors', () => {
    expect(() => resolveExtensionProductBrand('terra')).toThrow(
      'Unsupported __VULTISIG_PRODUCT_BRAND__'
    )
  })

  it('keeps the default manifest Vultisig-branded', () => {
    const manifest = applyExtensionBrandToManifest(
      baseManifest,
      extensionBrandConfigs.vultisig
    )

    expect(manifest.name).toBe('Vultisig Extension')
    expect(manifest.description).toContain('Vultisig Extension')
    expect(manifest.author?.name).toBe('Vultisig')
    expect(manifest.icons?.['128']).toBe('icon128.png')
  })

  it('brands the generated manifest for Station', () => {
    const manifest = applyExtensionBrandToManifest(
      baseManifest,
      extensionBrandConfigs.station
    )

    expect(manifest.name).toBe('Station Wallet')
    expect(manifest.description).toBe(
      'Station is a web application to interact with Terra Core and other supported chains.'
    )
    expect(manifest.author?.name).toBe('Terra')
    expect(manifest.icons?.['128']).toBe('icon128.png')
  })

  it('brands extension page titles per build flavor', () => {
    expect(
      applyExtensionBrandToHtml(
        '<html><head><title>Vultisig Extension</title></head></html>',
        extensionBrandConfigs.station.htmlTitle
      )
    ).toContain('<title>Station Wallet</title>')

    expect(
      applyExtensionBrandToHtml(
        '<html><head><title>Vultisig Extension Popup</title></head></html>',
        extensionBrandConfigs.vultisig.popupTitle
      )
    ).toContain('<title>Vultisig Extension Popup</title>')
  })

  it('uses Station provider identity for Station builds', () => {
    expect(extensionBrandConfigs.station.provider.walletPickerName).toBe(
      'Station'
    )
    expect(extensionBrandConfigs.station.provider.walletPickerIdentifier).toBe(
      'station'
    )
    expect(extensionBrandConfigs.station.provider.eip6963Name).toBe(
      'Station Wallet'
    )
    expect(extensionBrandConfigs.station.provider.eip6963Rdns).toBe(
      'money.station'
    )
  })
})
