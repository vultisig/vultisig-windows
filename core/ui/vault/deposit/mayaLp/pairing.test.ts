import { describe, expect, it } from 'vitest'

import {
  getMayaLpPairedAddress,
  getMayaLpPairing,
  MayachainLiquidityProvider,
} from './pairing'

const cacaoAddress = 'maya1vault'
const assetAddress = '0xVault'

const record = (
  fields: Partial<MayachainLiquidityProvider>
): MayachainLiquidityProvider => ({ units: '0', ...fields })

describe('getMayaLpPairing', () => {
  it('pairs when the vault has no record', () => {
    expect(
      getMayaLpPairing({ provider: null, cacaoAddress, assetAddress })
    ).toBe('pairable')
  })

  it('pairs on a zero-unit record with nothing pending', () => {
    expect(
      getMayaLpPairing({ provider: record({}), cacaoAddress, assetAddress })
    ).toBe('pairable')
  })

  it('completes a pending half that fixed the same addresses', () => {
    const provider = record({
      cacao_address: cacaoAddress,
      asset_address: '0xvault',
      pending_asset: '100000',
    })

    expect(getMayaLpPairing({ provider, cacaoAddress, assetAddress })).toBe(
      'pairable'
    )
  })

  it('refuses a pending half that fixed another asset address', () => {
    const provider = record({
      cacao_address: cacaoAddress,
      asset_address: '0xOther',
      pending_cacao: '5000000000',
    })

    expect(getMayaLpPairing({ provider, cacaoAddress, assetAddress })).toBe(
      'mismatch'
    )
  })

  it('reads a live position without an asset address as CACAO-only', () => {
    const provider = record({ cacao_address: cacaoAddress, units: '134596' })

    expect(getMayaLpPairing({ provider, cacaoAddress, assetAddress })).toBe(
      'cacaoOnly'
    )
  })

  it('pairs a live position with the same asset address', () => {
    const provider = record({
      cacao_address: cacaoAddress,
      asset_address: assetAddress,
      units: '134596',
    })

    expect(getMayaLpPairing({ provider, cacaoAddress, assetAddress })).toBe(
      'pairable'
    )
  })

  it('flags a live position paired with another asset address', () => {
    const provider = record({
      cacao_address: cacaoAddress,
      asset_address: '0xOther',
      units: '134596',
    })

    expect(getMayaLpPairing({ provider, cacaoAddress, assetAddress })).toBe(
      'pairedWithOther'
    )
  })
})

describe('getMayaLpPairedAddress', () => {
  it('names the asset address on the CACAO side when the record pairs', () => {
    expect(
      getMayaLpPairedAddress({
        isCacaoSide: true,
        pairing: 'pairable',
        cacaoAddress,
        assetAddress,
      })
    ).toBe(assetAddress)
  })

  it('adds CACAO alone to a pool the vault cannot fund from the asset side', () => {
    expect(
      getMayaLpPairedAddress({
        isCacaoSide: true,
        pairing: 'pairable',
        cacaoAddress,
        assetAddress: undefined,
      })
    ).toBe('')
  })

  it('adds CACAO alone to a live position it cannot pair with', () => {
    for (const pairing of ['cacaoOnly', 'pairedWithOther'] as const) {
      expect(
        getMayaLpPairedAddress({
          isCacaoSide: true,
          pairing,
          cacaoAddress,
          assetAddress,
        })
      ).toBe('')
    }
  })

  it('refuses the CACAO side against a pending half with other addresses', () => {
    expect(
      getMayaLpPairedAddress({
        isCacaoSide: true,
        pairing: 'mismatch',
        cacaoAddress,
        assetAddress,
      })
    ).toBeNull()
  })

  it('names the CACAO address on the asset side only when the record pairs', () => {
    expect(
      getMayaLpPairedAddress({
        isCacaoSide: false,
        pairing: 'pairable',
        cacaoAddress,
        assetAddress,
      })
    ).toBe(cacaoAddress)

    for (const pairing of [
      'cacaoOnly',
      'pairedWithOther',
      'mismatch',
    ] as const) {
      expect(
        getMayaLpPairedAddress({
          isCacaoSide: false,
          pairing,
          cacaoAddress,
          assetAddress,
        })
      ).toBeNull()
    }
  })
})
