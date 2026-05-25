import { mkdtemp, readdir, readFile, rm, stat } from 'node:fs/promises'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from '@playwright/test'

const expectedByBrand = {
  vultisig: {
    manifestName: 'Vultisig Extension',
    manifestDescription:
      'Vultisig Extension integrates Vultisig into web applications, enabling users to securely sign blockchain transactions.',
    manifestAuthor: {
      name: 'Vultisig',
      email: 'info@vultisig.com',
      url: 'https://vultisig.com',
    },
    manifestAuthorLabel: 'Vultisig <info@vultisig.com>',
    providerName: 'Vultisig',
    providerRdns: 'me.vultisig',
    walletIdentifier: 'vultisig',
    walletName: 'Vultisig',
  },
  station: {
    manifestName: 'Station Wallet',
    manifestDescription:
      'Station is a web application to interact with Terra Core and other supported chains.',
    manifestAuthor: {
      name: 'Terra',
      email: 'engineering@terra.money',
      url: 'https://terra.money',
    },
    manifestAuthorLabel: 'Terra <engineering@terra.money>',
    providerName: 'Station Wallet',
    providerRdns: 'money.station',
    walletIdentifier: 'station',
    walletName: 'Station',
  },
}

const iconNames = [
  'icon16.png',
  'icon32.png',
  'icon48.png',
  'icon64.png',
  'icon128.png',
]

const expectedIconPaths = {
  16: 'icon16.png',
  32: 'icon32.png',
  48: 'icon48.png',
  64: 'icon64.png',
  128: 'icon128.png',
}

const currentDir = path.dirname(fileURLToPath(import.meta.url))

const readArgs = () => {
  const args = process.argv.slice(2)
  const options = {
    brand: 'vultisig',
    distDir: path.resolve(currentDir, '../dist'),
    skipBrowser: false,
  }

  while (args.length > 0) {
    const arg = args.shift()

    if (!arg) {
      continue
    }

    if (arg === '--dist') {
      const distDir = args.shift()
      if (!distDir) {
        throw new Error('--dist requires a path')
      }
      options.distDir = path.resolve(process.cwd(), distDir)
      continue
    }

    if (arg === '--skip-browser') {
      options.skipBrowser = true
      continue
    }

    if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`)
    }

    options.brand = arg
  }

  return options
}

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

const assertPathExists = async filePath => {
  const details = await stat(filePath)
  if (!details.isFile()) {
    throw new Error(`Expected file at ${filePath}`)
  }
}

const assertManifestAuthor = (actual, expected) => {
  if (typeof actual === 'string') {
    assertEqual(actual, expected.manifestAuthorLabel, 'manifest.author')
    return
  }

  assertEqual(
    actual?.name,
    expected.manifestAuthor.name,
    'manifest.author.name'
  )
  assertEqual(
    actual?.email,
    expected.manifestAuthor.email,
    'manifest.author.email'
  )
  assertEqual(actual?.url, expected.manifestAuthor.url, 'manifest.author.url')
}

const assertIconMap = (actual, label) => {
  for (const [size, fileName] of Object.entries(expectedIconPaths)) {
    assertEqual(actual?.[size], fileName, `${label}.${size}`)
  }
}

const readInpageSources = async distDir => {
  const inpagePath = path.resolve(distDir, 'inpage.js')
  const assetsDir = path.resolve(distDir, 'assets')
  const sources = [await readFile(inpagePath, 'utf8')]

  try {
    const entries = await readdir(assetsDir, { withFileTypes: true })
    const inpageAssetPaths = entries
      .filter(
        entry =>
          entry.isFile() &&
          entry.name.endsWith('.js') &&
          entry.name.includes('inpage')
      )
      .map(entry => path.resolve(assetsDir, entry.name))

    sources.push(
      ...(await Promise.all(
        inpageAssetPaths.map(filePath => readFile(filePath, 'utf8'))
      ))
    )
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      throw error
    }
  }

  return sources.join('\n')
}

const assertStaticBrand = async ({ distDir, expected }) => {
  const manifestPath = path.resolve(distDir, 'manifest.json')
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  const inpageSource = await readInpageSources(distDir)

  assertEqual(manifest.name, expected.manifestName, 'manifest.name')
  assertEqual(
    manifest.description,
    expected.manifestDescription,
    'manifest.description'
  )
  assertManifestAuthor(manifest.author, expected)

  for (const fileName of iconNames) {
    await assertPathExists(path.resolve(distDir, fileName))
  }

  assertIconMap(manifest.icons, 'manifest.icons')

  const actionIcons = manifest.action?.default_icon
  if (!actionIcons || typeof actionIcons !== 'object') {
    throw new Error('manifest.action.default_icon must be an icon path map')
  }
  assertIconMap(actionIcons, 'manifest.action.default_icon')

  assertIncludes(inpageSource, expected.providerName, 'inpage provider name')
  assertIncludes(inpageSource, expected.providerRdns, 'inpage provider rdns')
  assertIncludes(
    inpageSource,
    expected.walletIdentifier,
    'Station-compatible wallet identifier'
  )
}

const createTestServer = async () => {
  const html = String.raw`<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Extension Brand QA</title></head>
  <body><main>Extension Brand QA</main></body>
</html>`

  const server = http.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html' })
    response.end(html)
  })

  await new Promise(resolve => {
    server.listen(0, '127.0.0.1', resolve)
  })

  const address = server.address()
  const port = typeof address === 'object' && address ? address.port : 0

  return {
    url: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise(resolve => {
        server.close(resolve)
      }),
  }
}

const getExtensionId = async context => {
  let [worker] = context.serviceWorkers()
  if (!worker) {
    worker = await context.waitForEvent('serviceworker', { timeout: 10_000 })
  }

  return worker.url().split('/')[2]
}

const assertRuntimeBrand = async ({ distDir, expected }) => {
  const profileDir = await mkdtemp(
    path.join(os.tmpdir(), 'vultisig-extension-brand-qa-')
  )
  const server = await createTestServer()

  const context = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${distDir}`,
      `--load-extension=${distDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-default-apps',
      '--disable-popup-blocking',
      '--window-position=-3000,-3000',
      '--window-size=480,600',
    ],
  })

  try {
    const extensionId = await getExtensionId(context)
    const extensionPage = await context.newPage()
    await extensionPage.goto(`chrome-extension://${extensionId}/index.html`)

    const runtimeManifest = await extensionPage.evaluate(() =>
      globalThis.chrome.runtime.getManifest()
    )
    assertEqual(
      runtimeManifest.name,
      expected.manifestName,
      'runtime manifest.name'
    )
    assertEqual(
      runtimeManifest.description,
      expected.manifestDescription,
      'runtime manifest.description'
    )
    assertManifestAuthor(runtimeManifest.author, expected)

    const page = await context.newPage()
    await page.goto(server.url)

    const providerInfo = await page.evaluate(
      ({ providerRdns }) =>
        new Promise(resolve => {
          const seen = []
          const handler = event => {
            const info = event.detail?.info
            if (!info) {
              return
            }

            seen.push({
              name: info.name,
              rdns: info.rdns,
              uuid: info.uuid,
              hasIcon: !!info.icon,
            })

            if (info.rdns === providerRdns) {
              window.removeEventListener('eip6963:announceProvider', handler)
              resolve({
                name: info.name,
                rdns: info.rdns,
                uuid: info.uuid,
                hasIcon: !!info.icon,
              })
            }
          }

          window.addEventListener('eip6963:announceProvider', handler)
          window.dispatchEvent(new Event('eip6963:requestProvider'))

          setTimeout(() => {
            window.removeEventListener('eip6963:announceProvider', handler)
            resolve({ seen })
          }, 5000)
        }),
      { providerRdns: expected.providerRdns }
    )

    if (!providerInfo || 'seen' in providerInfo) {
      throw new Error(
        `Did not receive primary EIP-6963 announcement for ${expected.providerRdns}. ` +
          `Seen: ${JSON.stringify(providerInfo?.seen ?? [])}`
      )
    }

    assertEqual(
      providerInfo.name,
      expected.providerName,
      'EIP-6963 provider name'
    )
    assertEqual(
      providerInfo.rdns,
      expected.providerRdns,
      'EIP-6963 provider rdns'
    )
    if (!providerInfo.uuid) {
      throw new Error('EIP-6963 provider uuid was empty')
    }
    if (!providerInfo.hasIcon) {
      throw new Error('EIP-6963 provider icon was empty')
    }

    const walletPickerInfo = await page.waitForFunction(
      ({ walletIdentifier, walletName }) => {
        const matches = wallet =>
          wallet?.identifier === walletIdentifier &&
          wallet?.name === walletName &&
          !!wallet?.icon

        return ['terraWallets', 'interchainWallets'].every(
          key => Array.isArray(window[key]) && window[key].some(matches)
        )
      },
      {
        walletIdentifier: expected.walletIdentifier,
        walletName: expected.walletName,
      },
      { timeout: 10_000 }
    )

    if (!(await walletPickerInfo.jsonValue())) {
      throw new Error('Station-compatible wallet-picker metadata was not found')
    }
  } finally {
    await context.close()
    await server.close()
    await rm(profileDir, { recursive: true, force: true })
  }
}

const options = readArgs()
const expected = expectedByBrand[options.brand]

if (!expected) {
  throw new Error(`Unknown extension brand QA target: ${options.brand}`)
}

await assertStaticBrand({ distDir: options.distDir, expected })

if (!options.skipBrowser) {
  await assertRuntimeBrand({ distDir: options.distDir, expected })
}

console.log(
  `Extension brand QA passed for ${options.brand}` +
    (options.skipBrowser ? ' (static only).' : '.')
)
