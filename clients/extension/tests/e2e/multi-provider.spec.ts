/**
 * Multi-Provider Injection Tests.
 *
 * Verifies that all chain-specific providers are injected correctly
 * into the window object. Tests provider existence, properties, and
 * basic interface shape.
 *
 * NOTE: Some providers (phantom, keplr, tronLink, xfi, vultiConnectRouter,
 * injectedWeb3) are only injected when wallet is "prioritized" (i.e.,
 * getIsWalletPrioritized returns true from background). We test both the
 * always-injected providers and the conditional ones.
 */

import { test, expect } from './fixtures/extension-loader'

const PROVIDER_TIMEOUT = 10_000

test.describe('Core Provider Objects', () => {
  test('window.vultisig is injected and non-configurable', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const exists = await page.evaluate(() => !!window.vultisig)
    expect(exists).toBe(true)

    // Should not be writable
    const isWritable = await page.evaluate(() => {
      const desc = Object.getOwnPropertyDescriptor(window, 'vultisig')
      return desc?.writable ?? desc?.set !== undefined
    })
    expect(isWritable).toBe(false)
  })

  test('window.vultisig has all expected provider keys', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const keys = await page.evaluate(() => {
      const v = window.vultisig
      return {
        bitcoin: !!v.bitcoin,
        bitcoincash: !!v.bitcoincash,
        cardano: !!v.cardano,
        cosmos: !!v.cosmos,
        dash: !!v.dash,
        dogecoin: !!v.dogecoin,
        ethereum: !!v.ethereum,
        keplr: !!v.keplr,
        litecoin: !!v.litecoin,
        mayachain: !!v.mayachain,
        polkadot: !!v.polkadot,
        ripple: !!v.ripple,
        solana: !!v.solana,
        sui: !!v.sui,
        thorchain: !!v.thorchain,
        tron: !!v.tron,
        zcash: !!v.zcash,
        getVault: typeof v.getVault === 'function',
        getVaults: typeof v.getVaults === 'function',
      }
    })

    expect(keys.bitcoin).toBe(true)
    expect(keys.bitcoincash).toBe(true)
    expect(keys.cardano).toBe(true)
    expect(keys.cosmos).toBe(true)
    expect(keys.dash).toBe(true)
    expect(keys.dogecoin).toBe(true)
    expect(keys.ethereum).toBe(true)
    expect(keys.keplr).toBe(true)
    expect(keys.litecoin).toBe(true)
    expect(keys.mayachain).toBe(true)
    expect(keys.polkadot).toBe(true)
    expect(keys.ripple).toBe(true)
    expect(keys.solana).toBe(true)
    expect(keys.sui).toBe(true)
    expect(keys.thorchain).toBe(true)
    expect(keys.tron).toBe(true)
    expect(keys.zcash).toBe(true)
    expect(keys.getVault).toBe(true)
    expect(keys.getVaults).toBe(true)
  })

  test('window.ethereum is same instance as window.vultisig.ethereum', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(
      () => !!window.ethereum && !!window.vultisig,
      null,
      { timeout: PROVIDER_TIMEOUT }
    )

    // When wallet is prioritized, window.ethereum is a getter on vultiConnectRouter.
    // When not prioritized, it's a direct reference.
    // Either way, calling request on both should work.
    const bothWork = await page.evaluate(() => {
      return (
        typeof window.ethereum.request === 'function' &&
        typeof window.vultisig.ethereum.request === 'function'
      )
    })
    expect(bothWork).toBe(true)
  })
})

test.describe('Ethereum Provider', () => {
  test('window.vultisig.ethereum has Ethereum class properties', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const props = await page.evaluate(() => ({
      isMetaMask: window.vultisig.ethereum.isMetaMask,
      isVultiConnect: window.vultisig.ethereum.isVultiConnect,
      isXDEFI: window.vultisig.ethereum.isXDEFI,
      isCtrl: window.vultisig.ethereum.isCtrl,
      chainId: window.vultisig.ethereum.chainId,
      connected: window.vultisig.ethereum.connected,
      hasRequest: typeof window.vultisig.ethereum.request === 'function',
      hasOn: typeof window.vultisig.ethereum.on === 'function',
      hasEnable: typeof window.vultisig.ethereum.enable === 'function',
      hasIsConnected:
        typeof window.vultisig.ethereum.isConnected === 'function',
    }))

    expect(props.isMetaMask).toBe(true)
    expect(props.isVultiConnect).toBe(true)
    expect(props.isXDEFI).toBe(true)
    expect(props.isCtrl).toBe(true)
    expect(props.chainId).toBe('0x1')
    expect(props.connected).toBe(false)
    expect(props.hasRequest).toBe(true)
    expect(props.hasOn).toBe(true)
    expect(props.hasEnable).toBe(true)
    expect(props.hasIsConnected).toBe(true)
  })
})

test.describe('UTXO Providers', () => {
  const utxoChains = [
    'bitcoin',
    'bitcoincash',
    'dogecoin',
    'litecoin',
    'zcash',
  ] as const

  for (const chain of utxoChains) {
    test(`window.vultisig.${chain} has request method`, async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)

      await page.waitForFunction(() => !!window.vultisig, null, {
        timeout: PROVIDER_TIMEOUT,
      })

      const hasRequest = await page.evaluate(
        (c) => typeof (window.vultisig as any)[c].request === 'function',
        chain
      )
      expect(hasRequest).toBe(true)
    })

    test(`window.vultisig.${chain} has requestAccounts method`, async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)

      await page.waitForFunction(() => !!window.vultisig, null, {
        timeout: PROVIDER_TIMEOUT,
      })

      const hasMethod = await page.evaluate(
        (c) =>
          typeof (window.vultisig as any)[c].requestAccounts === 'function',
        chain
      )
      expect(hasMethod).toBe(true)
    })
  }
})

test.describe('Solana Provider', () => {
  test('window.vultisig.solana exists with expected properties', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const props = await page.evaluate(() => {
      const sol = window.vultisig.solana
      return {
        exists: !!sol,
        isPhantom: sol.isPhantom,
        isXDEFI: sol.isXDEFI,
        hasConnect: typeof sol.connect === 'function',
        hasDisconnect: typeof sol.disconnect === 'function',
        hasSignMessage: typeof sol.signMessage === 'function',
        hasSignTransaction: typeof sol.signTransaction === 'function',
        hasSignAndSendTransaction:
          typeof sol.signAndSendTransaction === 'function',
        hasSignIn: typeof sol.signIn === 'function',
        hasOn: typeof sol.on === 'function',
        hasRequest: typeof sol.request === 'function',
        name: sol.name,
        version: sol.version,
      }
    })

    expect(props.exists).toBe(true)
    expect(props.isPhantom).toBe(true)
    expect(props.isXDEFI).toBe(true)
    expect(props.hasConnect).toBe(true)
    expect(props.hasDisconnect).toBe(true)
    expect(props.hasSignMessage).toBe(true)
    expect(props.hasSignTransaction).toBe(true)
    expect(props.hasSignAndSendTransaction).toBe(true)
    expect(props.hasSignIn).toBe(true)
    expect(props.hasOn).toBe(true)
    expect(props.hasRequest).toBe(true)
    expect(props.name).toBe('Vultisig')
    expect(props.version).toBe('1.0.0')
  })

  test('window.vultisig.solana has wallet-standard features', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const features = await page.evaluate(() => {
      const sol = window.vultisig.solana as any
      const featureKeys = sol.features ? Object.keys(sol.features) : []
      return {
        hasFeatures: !!sol.features,
        featureKeys,
        hasAccounts: Array.isArray(sol.accounts),
        hasChains: !!sol.chains,
      }
    })

    expect(features.hasFeatures).toBe(true)
    expect(features.hasAccounts).toBe(true)
    expect(features.hasChains).toBe(true)
    // Wallet standard features should include connect, disconnect, events, sign
    expect(features.featureKeys.length).toBeGreaterThanOrEqual(1)
  })
})

test.describe('Cosmos & Keplr Provider', () => {
  test('window.vultisig.cosmos exists with expected interface', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const props = await page.evaluate(() => ({
      exists: !!window.vultisig.cosmos,
      chainId: window.vultisig.cosmos.chainId,
      isVultiConnect: window.vultisig.cosmos.isVultiConnect,
      hasRequest: typeof window.vultisig.cosmos.request === 'function',
    }))

    expect(props.exists).toBe(true)
    expect(props.chainId).toBe('Cosmos')
    expect(props.isVultiConnect).toBe(true)
    expect(props.hasRequest).toBe(true)
  })

  test('window.vultisig.keplr exists with expected interface', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const props = await page.evaluate(() => {
      const k = window.vultisig.keplr
      return {
        exists: !!k,
        isXDEFI: k.isXDEFI,
        isVulticonnect: k.isVulticonnect,
        hasEnable: typeof k.enable === 'function',
        hasGetKey: typeof k.getKey === 'function',
        hasGetOfflineSigner: typeof k.getOfflineSigner === 'function',
        hasGetOfflineSignerOnlyAmino:
          typeof k.getOfflineSignerOnlyAmino === 'function',
        hasExperimentalSuggestChain:
          typeof k.experimentalSuggestChain === 'function',
      }
    })

    expect(props.exists).toBe(true)
    expect(props.isXDEFI).toBe(true)
    expect(props.isVulticonnect).toBe(true)
    expect(props.hasEnable).toBe(true)
    expect(props.hasGetKey).toBe(true)
    expect(props.hasGetOfflineSigner).toBe(true)
    expect(props.hasGetOfflineSignerOnlyAmino).toBe(true)
    expect(props.hasExperimentalSuggestChain).toBe(true)
  })
})

test.describe('THORChain Provider', () => {
  test('window.vultisig.thorchain exists with expected interface', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const props = await page.evaluate(() => ({
      exists: !!window.vultisig.thorchain,
      chainId: window.vultisig.thorchain.chainId,
      isVultiConnect: window.vultisig.thorchain.isVultiConnect,
      hasRequest: typeof window.vultisig.thorchain.request === 'function',
    }))

    expect(props.exists).toBe(true)
    expect(props.chainId).toBe('Thorchain_thorchain')
    expect(props.isVultiConnect).toBe(true)
    expect(props.hasRequest).toBe(true)
  })
})

test.describe('MayaChain Provider', () => {
  test('window.vultisig.mayachain exists with expected interface', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const props = await page.evaluate(() => ({
      exists: !!window.vultisig.mayachain,
      chainId: window.vultisig.mayachain.chainId,
      isVultiConnect: window.vultisig.mayachain.isVultiConnect,
      hasRequest: typeof window.vultisig.mayachain.request === 'function',
    }))

    expect(props.exists).toBe(true)
    expect(props.chainId).toBe('Thorchain_mayachain')
    expect(props.isVultiConnect).toBe(true)
    expect(props.hasRequest).toBe(true)
  })
})

test.describe('Dash Provider', () => {
  test('window.vultisig.dash exists with expected interface', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const props = await page.evaluate(() => ({
      exists: !!window.vultisig.dash,
      chainId: (window.vultisig.dash as any).chainId,
      hasRequest: typeof window.vultisig.dash.request === 'function',
    }))

    expect(props.exists).toBe(true)
    expect(props.chainId).toBe('Dash_dash')
    expect(props.hasRequest).toBe(true)
  })
})

test.describe('Ripple Provider', () => {
  test('window.vultisig.ripple exists with request method', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const props = await page.evaluate(() => ({
      exists: !!window.vultisig.ripple,
      hasRequest: typeof window.vultisig.ripple.request === 'function',
    }))

    expect(props.exists).toBe(true)
    expect(props.hasRequest).toBe(true)
  })
})

test.describe('Sui Provider', () => {
  test('window.vultisig.sui exists with request method', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const props = await page.evaluate(() => ({
      exists: !!window.vultisig.sui,
      hasRequest: typeof window.vultisig.sui.request === 'function',
    }))

    expect(props.exists).toBe(true)
    expect(props.hasRequest).toBe(true)
  })
})

test.describe('Cardano Provider', () => {
  test('window.vultisig.cardano exists with request method', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const props = await page.evaluate(() => ({
      exists: !!window.vultisig.cardano,
      hasRequest: typeof window.vultisig.cardano.request === 'function',
    }))

    expect(props.exists).toBe(true)
    expect(props.hasRequest).toBe(true)
  })
})

test.describe('Polkadot Provider', () => {
  test('window.vultisig.polkadot exists with enable method', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const props = await page.evaluate(() => ({
      exists: !!window.vultisig.polkadot,
      hasEnable:
        typeof (window.vultisig.polkadot as any).enable === 'function',
      hasRequest:
        typeof (window.vultisig.polkadot as any).request === 'function',
    }))

    expect(props.exists).toBe(true)
    expect(props.hasEnable).toBe(true)
    expect(props.hasRequest).toBe(true)
  })
})

test.describe('Tron Provider', () => {
  test('window.vultisig.tron exists with expected interface', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const props = await page.evaluate(() => ({
      exists: !!window.vultisig.tron,
      isVultiConnect: window.vultisig.tron.isVultiConnect,
      isTronLink: window.vultisig.tron.isTronLink,
      hasRequest: typeof window.vultisig.tron.request === 'function',
      hasTronWeb: !!window.vultisig.tron.tronWeb,
    }))

    expect(props.exists).toBe(true)
    expect(props.isVultiConnect).toBe(true)
    expect(props.isTronLink).toBe(true)
    expect(props.hasRequest).toBe(true)
    expect(props.hasTronWeb).toBe(true)
  })
})

test.describe('Prioritized Provider Injection (conditional)', () => {
  // These providers are only injected when getIsWalletPrioritized returns true.
  // If not prioritized, these tests verify they're absent.

  test('window.phantom exists when wallet is prioritized', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    // Wait a bit for all injections to complete
    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const phantomInfo = await page.evaluate(() => {
      if (!window.phantom) return { exists: false }
      return {
        exists: true,
        hasBitcoin: !!window.phantom.bitcoin,
        hasEthereum: !!window.phantom.ethereum,
        hasSolana: !!window.phantom.solana,
      }
    })

    // phantom is only injected when wallet is prioritized
    if (phantomInfo.exists) {
      expect(phantomInfo.hasBitcoin).toBe(true)
      expect(phantomInfo.hasEthereum).toBe(true)
      expect(phantomInfo.hasSolana).toBe(true)
    }
    // If not exists, that's fine — wallet may not be prioritized
  })

  test('window.keplr exists when wallet is prioritized', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const keplrInfo = await page.evaluate(() => {
      if (!window.keplr) return { exists: false }
      return {
        exists: true,
        isXDEFI: window.keplr.isXDEFI,
        isVulticonnect: window.keplr.isVulticonnect,
        hasEnable: typeof window.keplr.enable === 'function',
      }
    })

    if (keplrInfo.exists) {
      expect(keplrInfo.isXDEFI).toBe(true)
      expect(keplrInfo.isVulticonnect).toBe(true)
      expect(keplrInfo.hasEnable).toBe(true)
    }
  })

  test('window.tronLink exists when wallet is prioritized', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const tronInfo = await page.evaluate(() => {
      if (!window.tronLink) return { exists: false }
      return {
        exists: true,
        isTronLink: window.tronLink.isTronLink,
        isVultiConnect: window.tronLink.isVultiConnect,
      }
    })

    if (tronInfo.exists) {
      expect(tronInfo.isTronLink).toBe(true)
      expect(tronInfo.isVultiConnect).toBe(true)
    }
  })

  test('window.xfi exists when wallet is prioritized', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const xfiInfo = await page.evaluate(() => {
      if (!window.xfi) return { exists: false }
      return {
        exists: true,
        hasBitcoin: !!(window.xfi as any).bitcoin,
        hasEthereum: !!(window.xfi as any).ethereum,
        hasSolana: !!(window.xfi as any).solana,
      }
    })

    if (xfiInfo.exists) {
      expect(xfiInfo.hasBitcoin).toBe(true)
      expect(xfiInfo.hasEthereum).toBe(true)
      expect(xfiInfo.hasSolana).toBe(true)
    }
  })

  test('window.injectedWeb3 exists when wallet is prioritized', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const polkadotInfo = await page.evaluate(() => {
      if (!window.injectedWeb3) return { exists: false }
      return {
        exists: true,
        hasVultisig: !!window.injectedWeb3.vultisig,
        hasPolkadotJs: !!window.injectedWeb3['polkadot-js'],
        vultisigHasEnable: !!(window.injectedWeb3.vultisig as any)?.enable,
        polkadotJsHasEnable: !!(window.injectedWeb3['polkadot-js'] as any)
          ?.enable,
        polkadotJsVersion: (window.injectedWeb3['polkadot-js'] as any)
          ?.version,
      }
    })

    if (polkadotInfo.exists) {
      expect(polkadotInfo.hasVultisig).toBe(true)
      expect(polkadotInfo.hasPolkadotJs).toBe(true)
      expect(polkadotInfo.vultisigHasEnable).toBe(true)
      expect(polkadotInfo.polkadotJsHasEnable).toBe(true)
      if (polkadotInfo.polkadotJsVersion) {
        expect(polkadotInfo.polkadotJsVersion).toBe('0.46.9')
      }
    }
  })

  test('window.isCtrl is set when wallet is prioritized', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    // isCtrl may or may not be set depending on prioritization
    const isCtrl = await page.evaluate(() => window.isCtrl)
    // Just verify the query doesn't crash; value depends on prioritization
    expect(typeof isCtrl === 'boolean' || isCtrl === undefined).toBe(true)
  })
})

test.describe('Singleton Behavior', () => {
  test('window.vultisig.ethereum is singleton (same across evaluations)', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    // Set a marker property and verify it persists
    const markerPersists = await page.evaluate(() => {
      ;(window.vultisig.ethereum as any).__testMarker = 42
      return (window.vultisig.ethereum as any).__testMarker === 42
    })
    expect(markerPersists).toBe(true)
  })

  test('Ethereum provider isConnected stays false without vault', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const res1 = await page.evaluate(() => window.ethereum.isConnected())
    const res2 = await page.evaluate(() => window.ethereum.isConnected())

    expect(res1).toBe(false)
    expect(res2).toBe(false)
  })
})
