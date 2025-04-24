import { describe, expect, it } from 'vitest'

import { derivePublicKey } from './derivePublicKey'

describe('getDerivePubKey', () => {
  it.each([
    {
      name: 'THORChain',
      path: "m/44'/931'/0'/0/0",
      expected:
        '021b31ee33430676def501923b12232a263589c132fae43b41c87b881887a59b45',
    },
    {
      name: 'Bitcoin',
      path: "m/84'/0'/0'/0/0",
      expected:
        '0345fbe562519bc8255426e71b10d5364bd1fc587e764c0225a8ced2182eb45ea2',
    },
    {
      name: 'Ethereum',
      path: "m/44'/60'/0'/0/0",
      expected:
        '0271758ba229f6939cb053e7e31cd809583dc4fef810f29d50317203b3280afb71',
    },
    {
      name: 'Bitcoin Cash',
      path: "m/44'/145'/0'/0/0",
      expected:
        '0299675ed28bcbf1442d934899c496f8883015518af4b2401cfdd5567b465d4e14',
    },
    {
      name: 'Dogecoin',
      path: "m/44'/3'/0'/0/0",
      expected:
        '0316cbe3bdb83758b72e8b29375f05401bdbd7f339ec6f3dbbe52fbf7d8e04ee39',
    },
    {
      name: 'Litecoin',
      path: "m/84'/2'/0'/0/0",
      expected:
        '036dabde7c2ee3bbaa55970e61e5862124d945873c692d29aab0761fb17555e647',
    },
    {
      name: 'Cosmos',
      path: "m/44'/118'/0'/0/0",
      expected:
        '03f8ce84e02207f1c4c8e1d993933c510929cae5708a935f4a5154b850ac9f31e7',
    },
    {
      name: 'Terra',
      path: "m/44'/330'/0'/0/0",
      expected:
        '0200dbba512ab1434e1c0584994f421adab8a8cb0f29592f1fe59303571f1451e7',
    },
    {
      name: 'Ripple',
      path: "m/44'/144'/0'/0/0",
      expected:
        '0399a00b1f42fccad7bca749d8a4bf28a151817be83a15750e614d00f769c047d0',
    },
    {
      name: 'Tron',
      path: "m/44'/195'/0'/0/0",
      expected:
        '027563cf088fe3d2112fd93f729f1aa611dcc87324bc32c642c3f74fab9b464eae',
    },
    {
      name: 'Dash',
      path: "m/44'/5'/0'/0/0",
      expected:
        '036c300a1da08044cab2f34174a5643c66ee246a7fd6ffedd5678aecab4b73fee3',
    },
  ])('should derive $name public key', ({ path, expected }) => {
    const hexRootPubKey =
      '029c1df50ce59f8c57887fb52e627cfec1b18329cbf48e43839b0784d9715b5fb7'
    const hexChainCode =
      '4c35b212ca0a817739352b08d819dd19a6db2239f8b303778e54b244021e1a96'

    const derivedPubKey = derivePublicKey({
      hexRootPubKey,
      hexChainCode,
      path,
    })
    expect(derivedPubKey).toBe(expected)
  })
})
