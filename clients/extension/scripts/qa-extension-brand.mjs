import { createHash } from 'node:crypto'
import { mkdtemp, readdir, readFile, rm, stat } from 'node:fs/promises'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from '@playwright/test'
import ts from 'typescript'

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
    htmlTitle: 'Vultisig Extension',
    popupTitle: 'Vultisig Extension Popup',
    providerName: 'Vultisig',
    providerRdns: 'me.vultisig',
    websiteUrl: 'https://vultisig.com',
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
    htmlTitle: 'Station Wallet',
    popupTitle: 'Station Wallet Popup',
    providerName: 'Station Wallet',
    providerRdns: 'money.station',
    websiteUrl: 'https://station.money',
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
const extensionDir = path.resolve(currentDir, '..')
const rootDir = path.resolve(extensionDir, '../..')

const toPosixPath = value => value.split(path.sep).join('/')

const getRootRelativePath = filePath =>
  toPosixPath(path.relative(rootDir, filePath))

const getDistRelativePath = ({ distDir, filePath }) =>
  toPosixPath(path.relative(distDir, filePath))

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

const getIconSourceDir = brand =>
  brand === 'station'
    ? path.resolve(extensionDir, 'public/brand/station')
    : path.resolve(extensionDir, 'public')

const getFileHash = async filePath =>
  createHash('sha256')
    .update(await readFile(filePath))
    .digest('hex')

const assertFileHashEqual = async (actualPath, expectedPath, label) => {
  assertEqual(
    await getFileHash(actualPath),
    await getFileHash(expectedPath),
    label
  )
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

const assertHtmlTitle = async ({ distDir, fileName, expectedTitle }) => {
  const source = await readFile(path.resolve(distDir, fileName), 'utf8')
  assertIncludes(source, `<title>${expectedTitle}</title>`, `${fileName} title`)
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

const assertStaticBrand = async ({ brand, distDir, expected }) => {
  const manifestPath = path.resolve(distDir, 'manifest.json')
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  const inpageSource = await readInpageSources(distDir)
  const iconSourceDir = getIconSourceDir(brand)

  assertEqual(manifest.name, expected.manifestName, 'manifest.name')
  assertEqual(
    manifest.description,
    expected.manifestDescription,
    'manifest.description'
  )
  assertManifestAuthor(manifest.author, expected)

  for (const fileName of iconNames) {
    await assertPathExists(path.resolve(distDir, fileName))
    await assertFileHashEqual(
      path.resolve(distDir, fileName),
      path.resolve(iconSourceDir, fileName),
      `${fileName} hash`
    )
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

  await assertHtmlTitle({
    distDir,
    fileName: 'index.html',
    expectedTitle: expected.htmlTitle,
  })
  await assertHtmlTitle({
    distDir,
    fileName: 'popup.html',
    expectedTitle: expected.popupTitle,
  })
}

const disallowedStationLocaleTextPattern =
  /Vultisig|VULTISIG|沃尔蒂西格|(?:[a-z0-9-]+\.)?vultisig\.com/i
const disallowedStationSourceTextPattern =
  /Vultisig|VULTISIG|沃尔蒂西格|(?:[a-z0-9-]+\.)?vultisig\.com/
const disallowedStationAssetPattern =
  /install-app-logo\.png|vultisig-logo|vultisig-icon/i

const stationRawVultisigLocalePolicy = {
  follow_banner_button: {
    exposure: 'vultisigOnly',
    reason:
      'The X follow banner points to Vultisig social accounts and is only registered in Vultisig builds.',
    guard: {
      filePath: 'core/ui/vault/page/components/VaultOverview.tsx',
      patterns: [
        "currentProductBrand === 'vultisig'",
        "id: 'followOnX'",
        '<FollowOnXBanner',
      ],
    },
  },
  follow_banner_subtitle: {
    exposure: 'vultisigOnly',
    reason:
      'The X follow banner points to Vultisig social accounts and is only registered in Vultisig builds.',
    guard: {
      filePath: 'core/ui/vault/page/components/VaultOverview.tsx',
      patterns: [
        "currentProductBrand === 'vultisig'",
        "id: 'followOnX'",
        '<FollowOnXBanner',
      ],
    },
  },
  unlock_discount_tier_description_ultimate: {
    exposure: 'vultisigOnly',
    reason:
      'The VULT discount page is part of Vultisig token utility and is disabled for Station builds.',
    guards: [
      {
        filePath: 'core/ui/vult/discount/page.tsx',
        patterns: ["currentProductBrand === 'station'", 'return null'],
      },
      {
        filePath: 'core/ui/vault/swap/queries/useSwapQuoteQuery.ts',
        patterns: [
          "currentProductBrand === 'vultisig'",
          'enabled: useVultDiscounts',
          'vultDiscountTier: useVultDiscounts ?',
        ],
      },
      {
        filePath: 'core/ui/vault/swap/form/info/SwapDiscountInfo.tsx',
        patterns: [
          "currentProductBrand === 'station'",
          "discounts.filter(discount => !('vult' in discount))",
        ],
      },
    ],
  },
}

const stationRawVultisigSourcePolicyEntries = [
  {
    filePath: 'core/ui/settings/constants.ts',
    literal: 'https://docs.vultisig.com',
    exposure: 'vultisigOnly',
    reason: 'Vultisig documentation is only used for the Vultisig product.',
    guard: {
      filePath: 'core/ui/settings/constants.ts',
      patterns: [
        "currentProductBrand === 'station'",
        '? currentProductWebsiteUrl',
        ': vultisigEducationUrl',
      ],
    },
  },
  {
    filePath: 'core/ui/mpc/keygen/education/KeygenEducationPrompt.tsx',
    literal: 'https://docs.vultisig.com/vultisig-user-actions/creating-a-vault',
    exposure: 'vultisigOnly',
    reason: 'Station opens the Station product website for this help action.',
    guard: {
      filePath: 'core/ui/mpc/keygen/education/KeygenEducationPrompt.tsx',
      patterns: [
        "currentProductBrand === 'station'",
        'currentProductBrandConfig.websiteUrl',
      ],
    },
  },
  {
    filePath: 'core/ui/mpc/keygen/peers/KeygenPeerDiscoveryStep.tsx',
    literal: 'https://docs.vultisig.com/vultisig-user-actions/creating-a-vault',
    exposure: 'vultisigOnly',
    reason: 'Station opens the Station product website for keygen help.',
    guard: {
      filePath: 'core/ui/mpc/keygen/peers/KeygenPeerDiscoveryStep.tsx',
      patterns: [
        "currentProductBrand === 'station'",
        'currentProductBrandConfig.websiteUrl',
      ],
    },
  },
  {
    filePath: 'core/ui/mpc/keygen/peers/KeygenPeerDiscoveryStep.tsx',
    literal:
      'https://docs.vultisig.com/vultisig-vault-user-actions/managing-your-vault/vault-reshare',
    exposure: 'vultisigOnly',
    reason: 'Station opens the Station product website for reshare help.',
    guard: {
      filePath: 'core/ui/mpc/keygen/peers/KeygenPeerDiscoveryStep.tsx',
      patterns: [
        "currentProductBrand === 'station'",
        'currentProductBrandConfig.websiteUrl',
      ],
    },
  },
  {
    filePath: 'core/ui/agent/config.ts',
    literal: 'https://agent.vultisig.com',
    exposure: 'backendEndpoint',
    reason: 'Agent service endpoint; not surfaced as product copy.',
  },
  {
    filePath: 'core/ui/agent/config.ts',
    literal: 'https://verifier.vultisig.com',
    exposure: 'backendEndpoint',
    reason: 'Verifier service endpoint; not surfaced as product copy.',
  },
  {
    filePath: 'core/ui/agent/config.ts',
    literal: 'https://api.vultisig.com/router',
    exposure: 'backendEndpoint',
    reason: 'Relay API endpoint; not surfaced as product copy.',
  },
  {
    filePath: 'core/ui/qbtc/claim/components/ClaimPreparingTxPhase.tsx',
    literal: 'https://api.vultisig.com/qbtc-proof',
    exposure: 'backendEndpoint',
    reason: 'QBTC proof API endpoint; not surfaced as product copy.',
  },
  {
    filePath: 'core/ui/agent/tools/handlers/marketPrice.ts',
    literal: 'api.vultisig.com/coingeicko/api/v3/simple/price',
    exposure: 'backendEndpoint',
    reason: 'Market price API source descriptor; not product copy.',
  },
  {
    filePath: 'core/ui/defi/chain/queries/constants.ts',
    literal: 'https://api.vultisig.com/ruji/api/graphql',
    exposure: 'backendEndpoint',
    reason: 'Ruji staking API endpoint; not surfaced as product copy.',
  },
  {
    filePath: 'core/ui/agent/tools/shared/fastVaultApi.ts',
    literal: 'https://api.vultisig.com',
    exposure: 'backendEndpoint',
    reason: 'Fast Vault API endpoint; not surfaced as product copy.',
  },
  {
    filePath: 'core/ui/agent/tools/shared/pluginConfig.ts',
    literal: 'https://plugin-dca-swap.prod.plugins.vultisig.com',
    exposure: 'backendEndpoint',
    reason: 'Plugin service endpoint; not surfaced as product copy.',
  },
  {
    filePath: 'core/ui/agent/tools/shared/pluginConfig.ts',
    literal: 'https://plugin-fees.prod.plugins.vultisig.com',
    exposure: 'backendEndpoint',
    reason: 'Plugin service endpoint; not surfaced as product copy.',
  },
  {
    filePath: 'core/ui/agent/tools/shared/pluginConfig.ts',
    literal: 'https://plugin-dca-send.prod.plugins.vultisig.com',
    exposure: 'backendEndpoint',
    reason: 'Plugin service endpoint; not surfaced as product copy.',
  },
  {
    filePath: 'core/ui/storage/remoteFeatureFlags.ts',
    literal: 'https://api.vultisig.com/feature/release.json',
    exposure: 'backendEndpoint',
    reason: 'Remote feature flag endpoint; not surfaced as product copy.',
  },
]

const productBrandInterpolationKeys = new Set([
  'productExtensionName',
  'productName',
  'productWebsiteHost',
  'productWebsiteUrl',
])

const disallowedCoreConfigProductBrandImports = new Set([
  'productName',
  'productRootDomain',
])

const getSourcePolicyKey = ({ filePath, literal }) => `${filePath}\0${literal}`

const stationRawVultisigSourcePolicy = new Map(
  stationRawVultisigSourcePolicyEntries.map(policy => [
    getSourcePolicyKey(policy),
    policy,
  ])
)

const getPropertyName = name => {
  if (
    ts.isIdentifier(name) ||
    ts.isStringLiteral(name) ||
    ts.isNumericLiteral(name)
  ) {
    return name.text
  }

  return undefined
}

const getLocaleStringEntries = source => {
  const sourceFile = ts.createSourceFile(
    'locale.ts',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  )
  const result = []

  const visit = (node, pathParts = []) => {
    if (!ts.isPropertyAssignment(node)) {
      ts.forEachChild(node, child => visit(child, pathParts))
      return
    }

    const propertyName = getPropertyName(node.name)
    const nextPath = propertyName ? [...pathParts, propertyName] : pathParts
    const value = node.initializer

    if (ts.isObjectLiteralExpression(value)) {
      for (const property of value.properties) {
        visit(property, nextPath)
      }
      return
    }

    if (ts.isStringLiteralLike(value)) {
      result.push({
        keyPath: nextPath.join('.'),
        value: value.text,
      })
    }
  }

  visit(sourceFile)

  return result
}

const isModuleSpecifier = node =>
  (ts.isImportDeclaration(node.parent) &&
    node.parent.moduleSpecifier === node) ||
  (ts.isExportDeclaration(node.parent) && node.parent.moduleSpecifier === node)

const getStringLiterals = source => {
  const sourceFile = ts.createSourceFile(
    'brand-audit.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )
  const result = []

  const visit = node => {
    if (ts.isStringLiteralLike(node) && !isModuleSpecifier(node)) {
      result.push(node.text)
    } else if (ts.isJsxText(node)) {
      result.push(node.text)
    } else if (ts.isTemplateExpression(node)) {
      result.push(node.head.text)
      for (const span of node.templateSpans) {
        result.push(span.literal.text)
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return result
}

const getDisallowedCoreConfigProductBrandImports = source => {
  const sourceFile = ts.createSourceFile(
    'brand-audit.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )
  const result = []

  const visit = node => {
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      node.moduleSpecifier.text === '@vultisig/core-config'
    ) {
      const namedBindings = node.importClause?.namedBindings
      if (namedBindings && ts.isNamedImports(namedBindings)) {
        for (const element of namedBindings.elements) {
          const importedName = element.propertyName?.text ?? element.name.text
          if (disallowedCoreConfigProductBrandImports.has(importedName)) {
            result.push(importedName)
          }
        }
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return result
}

const listFiles = async dir => {
  const entries = await readdir(dir, { withFileTypes: true })
  const groups = await Promise.all(
    entries.map(async entry => {
      const entryPath = path.resolve(dir, entry.name)
      return entry.isDirectory() ? listFiles(entryPath) : [entryPath]
    })
  )

  return groups.flat()
}

const assertGuardEvidence = async ({ label, guard }) => {
  if (!guard) {
    throw new Error(`${label} raw Vultisig policy is missing guard evidence`)
  }

  const source = await readFile(path.resolve(rootDir, guard.filePath), 'utf8')
  for (const pattern of guard.patterns) {
    assertIncludes(source, pattern, `${label} guard in ${guard.filePath}`)
  }
}

const assertPolicyGuardEvidence = async ({ label, policy }) => {
  const guards = policy.guards ?? (policy.guard ? [policy.guard] : [])

  if (guards.length === 0) {
    throw new Error(`${label} raw Vultisig policy is missing guard evidence`)
  }

  for (const guard of guards) {
    await assertGuardEvidence({ label, guard })
  }
}

const assertSourcePolicyEvidence = async ({ label, policy }) => {
  if (!policy.reason) {
    throw new Error(`${label} raw Vultisig policy is missing a reason`)
  }

  if (policy.guard || policy.guards) {
    await assertPolicyGuardEvidence({ label, policy })
  } else if (policy.exposure !== 'backendEndpoint') {
    throw new Error(`${label} raw Vultisig policy is missing guard evidence`)
  }
}

const getProductInterpolationVariableNames = value =>
  Array.from(
    value.matchAll(/{{\s*(product[A-Za-z0-9_]+)\s*}}/g),
    match => match[1]
  )

const assertStationLocaleText = async () => {
  const localeDir = path.resolve(rootDir, 'core/ui/i18n/locales')
  const localePaths = (await listFiles(localeDir)).filter(filePath =>
    filePath.endsWith('.ts')
  )
  const failures = []
  const guardChecks = new Map()
  const policyKeysSeen = new Set()

  for (const filePath of localePaths) {
    const source = await readFile(filePath, 'utf8')
    const relativeFilePath = getRootRelativePath(filePath)

    for (const { keyPath, value } of getLocaleStringEntries(source)) {
      for (const variableName of getProductInterpolationVariableNames(value)) {
        if (!productBrandInterpolationKeys.has(variableName)) {
          failures.push(
            `${relativeFilePath}:${keyPath}: unknown product interpolation variable "{{${variableName}}}"`
          )
        }
      }

      if (!disallowedStationLocaleTextPattern.test(value)) {
        continue
      }

      const policy = stationRawVultisigLocalePolicy[keyPath]
      if (!policy) {
        failures.push(`${relativeFilePath}:${keyPath}: ${value}`)
        continue
      }

      if (policy.exposure !== 'vultisigOnly') {
        failures.push(
          `${relativeFilePath}:${keyPath}: raw Vultisig policy must be Vultisig-only`
        )
        continue
      }

      policyKeysSeen.add(keyPath)
      guardChecks.set(keyPath, policy)
    }
  }

  for (const [keyPath, policy] of guardChecks) {
    try {
      await assertPolicyGuardEvidence({ label: keyPath, policy })
    } catch (error) {
      failures.push(error.message)
    }
  }

  for (const keyPath of Object.keys(stationRawVultisigLocalePolicy)) {
    if (!policyKeysSeen.has(keyPath)) {
      failures.push(
        `${keyPath}: raw Vultisig policy no longer matches a locale key`
      )
    }
  }

  if (failures.length > 0) {
    throw new Error(
      `Station locale text has raw Vultisig strings that must use product interpolation or be intentionally allowlisted:\n${failures.join('\n')}`
    )
  }
}

const sourceStringAllowlist = [
  /clients\/extension\/src\/brand\/extensionBrandConfig\.ts$/,
  /core\/ui\/product\/brand\.ts$/,
  /core\/ui\/i18n\/utils\/i18nGlossary\.ts$/,
]

const shouldAuditSourceFile = filePath => {
  const relativeFilePath = getRootRelativePath(filePath)

  return (
    (relativeFilePath.endsWith('.ts') || relativeFilePath.endsWith('.tsx')) &&
    !relativeFilePath.includes('/locales/') &&
    !relativeFilePath.includes('/coverage/') &&
    !relativeFilePath.includes('/tests/') &&
    !relativeFilePath.endsWith('.test.ts') &&
    !relativeFilePath.endsWith('.test.tsx') &&
    !relativeFilePath.endsWith('.spec.ts') &&
    !relativeFilePath.endsWith('.spec.tsx') &&
    !sourceStringAllowlist.some(pattern => pattern.test(relativeFilePath))
  )
}

const assertNoStationHardcodedVisibleBrand = async () => {
  const sourceRoots = [
    path.resolve(rootDir, 'clients/extension/src'),
    path.resolve(rootDir, 'core/inpage-provider'),
    path.resolve(rootDir, 'core/ui'),
  ]
  const sourcePaths = (
    await Promise.all(sourceRoots.map(root => listFiles(root)))
  )
    .flat()
    .filter(shouldAuditSourceFile)
  const failures = []
  const sourcePolicyKeysSeen = new Set()

  for (const filePath of sourcePaths) {
    const source = await readFile(filePath, 'utf8')
    const relativeFilePath = getRootRelativePath(filePath)

    if (relativeFilePath.startsWith('core/ui/')) {
      for (const importedName of getDisallowedCoreConfigProductBrandImports(
        source
      )) {
        failures.push(
          `${relativeFilePath}: imports ${importedName} from @vultisig/core-config; use currentProductBrandConfig for Station-aware product surfaces`
        )
      }
    }

    for (const literal of getStringLiterals(source)) {
      if (
        !disallowedStationSourceTextPattern.test(literal) &&
        !disallowedStationAssetPattern.test(literal)
      ) {
        continue
      }

      const policy = stationRawVultisigSourcePolicy.get(
        getSourcePolicyKey({ filePath: relativeFilePath, literal })
      )

      if (!policy) {
        failures.push(`${relativeFilePath}: ${literal}`)
        continue
      }

      sourcePolicyKeysSeen.add(
        getSourcePolicyKey({ filePath: relativeFilePath, literal })
      )

      try {
        await assertSourcePolicyEvidence({
          label: `${relativeFilePath}: ${literal}`,
          policy,
        })
      } catch (error) {
        failures.push(error.message)
      }
    }
  }

  for (const [policyKey, policy] of stationRawVultisigSourcePolicy) {
    if (!sourcePolicyKeysSeen.has(policyKey)) {
      failures.push(
        `${policy.filePath}: ${policy.literal}: raw Vultisig source policy no longer matches a source string`
      )
    }
  }

  if (failures.length > 0) {
    throw new Error(
      `Station build has non-allowlisted hard-coded Vultisig string literals:\n${failures.join('\n')}`
    )
  }
}

const shouldAuditDistTextFile = filePath =>
  ['.css', '.html', '.json', '.svg'].includes(path.extname(filePath))

const assertNoStationDistBrandReferences = async distDir => {
  const failures = []
  const sourcePaths = (await listFiles(distDir)).filter(shouldAuditDistTextFile)

  for (const filePath of sourcePaths) {
    const source = await readFile(filePath, 'utf8')

    if (disallowedStationSourceTextPattern.test(source)) {
      failures.push(
        `${getDistRelativePath({ distDir, filePath })}: raw Vultisig text`
      )
    }

    if (disallowedStationAssetPattern.test(source)) {
      failures.push(
        `${getDistRelativePath({ distDir, filePath })}: Vultisig asset reference`
      )
    }
  }

  if (failures.length > 0) {
    throw new Error(
      `Station dist has non-allowlisted Vultisig brand references:\n${failures.join('\n')}`
    )
  }
}

const assertStationVisibleBrandSources = async ({ distDir }) => {
  await assertStationLocaleText()
  await assertNoStationHardcodedVisibleBrand()
  await assertNoStationDistBrandReferences(distDir)
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
  let context
  let server

  try {
    server = await createTestServer()
    context = await chromium.launchPersistentContext(profileDir, {
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
    await Promise.allSettled([
      context?.close(),
      server?.close(),
      rm(profileDir, { recursive: true, force: true }),
    ])
  }
}

const options = readArgs()
const expected = expectedByBrand[options.brand]

if (!expected) {
  throw new Error(`Unknown extension brand QA target: ${options.brand}`)
}

await assertStaticBrand({
  brand: options.brand,
  distDir: options.distDir,
  expected,
})

if (options.brand === 'station') {
  await assertStationVisibleBrandSources({ distDir: options.distDir })
}

if (!options.skipBrowser) {
  await assertRuntimeBrand({ distDir: options.distDir, expected })
}

console.log(
  `Extension brand QA passed for ${options.brand}` +
    (options.skipBrowser ? ' (static only).' : '.')
)
