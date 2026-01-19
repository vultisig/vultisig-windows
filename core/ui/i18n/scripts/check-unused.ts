import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'

const currentDirname = dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(currentDirname, '../../../..')

type Locale = {
  [key: string]: string | Locale
}

const flattenKeys = (obj: Locale, prefix = ''): string[] => {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key
    return typeof value === 'object' && value !== null
      ? flattenKeys(value, fullKey)
      : [fullKey]
  })
}

const getKeyPath = (key: string): string[] => key.split('.')

const removeKeyFromObject = (obj: Locale, keyPath: string[]): boolean => {
  if (keyPath.length === 0) return false

  const [first, ...rest] = keyPath

  if (rest.length === 0) {
    if (first in obj) {
      delete obj[first]
      return true
    }
    return false
  }

  const nested = obj[first]
  if (typeof nested === 'object' && nested !== null) {
    const removed = removeKeyFromObject(nested, rest)
    if (removed && Object.keys(nested).length === 0) {
      delete obj[first]
    }
    return removed
  }

  return false
}

const findSourceFiles = (dir: string): string[] => {
  const results: string[] = []

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (
        entry.name === 'node_modules' ||
        entry.name === 'dist' ||
        entry.name === '.git' ||
        entry.name === 'generated'
      ) {
        continue
      }
      results.push(...findSourceFiles(fullPath))
    } else if (entry.isFile()) {
      if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
        if (!entry.name.endsWith('.d.ts')) {
          results.push(fullPath)
        }
      }
    }
  }

  return results
}

const isTFunctionCall = (node: ts.Node): node is ts.CallExpression => {
  if (!ts.isCallExpression(node)) return false

  const expression = node.expression

  if (ts.isIdentifier(expression) && expression.text === 't') {
    return true
  }

  return false
}

const getTransComponentI18nKey = (
  node: ts.Node
): ts.StringLiteral | ts.JsxExpression | null => {
  if (!ts.isJsxSelfClosingElement(node) && !ts.isJsxOpeningElement(node)) {
    return null
  }

  const tagName = node.tagName
  if (!ts.isIdentifier(tagName) || tagName.text !== 'Trans') {
    return null
  }

  for (const attr of node.attributes.properties) {
    if (
      ts.isJsxAttribute(attr) &&
      ts.isIdentifier(attr.name) &&
      attr.name.text === 'i18nKey'
    ) {
      const initializer = attr.initializer
      if (initializer) {
        if (ts.isStringLiteral(initializer)) {
          return initializer
        }
        if (ts.isJsxExpression(initializer) && initializer.expression) {
          if (ts.isStringLiteral(initializer.expression)) {
            return initializer.expression
          }
        }
      }
    }
  }

  return null
}

const extractTemplatePrefix = (node: ts.TemplateExpression): string | null => {
  const head = node.head.text
  if (head.length > 0) {
    return head
  }
  return null
}

const analyzeTranslationUsage = (
  sourceFiles: string[]
): { usedKeys: Set<string>; usedPrefixes: Set<string>; warnings: string[] } => {
  const usedKeys = new Set<string>()
  const usedPrefixes = new Set<string>()
  const warnings: string[] = []

  const configPath = path.join(workspaceRoot, 'tsconfig.json')
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile)

  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    workspaceRoot
  )

  const program = ts.createProgram(sourceFiles, {
    ...parsedConfig.options,
    noEmit: true,
  })

  const checker = program.getTypeChecker()

  const visitNode = (node: ts.Node, sourceFile: ts.SourceFile) => {
    if (isTFunctionCall(node)) {
      const args = node.arguments
      if (args.length > 0) {
        const firstArg = args[0]

        if (ts.isStringLiteral(firstArg)) {
          usedKeys.add(firstArg.text)
        } else if (ts.isNoSubstitutionTemplateLiteral(firstArg)) {
          usedKeys.add(firstArg.text)
        } else if (ts.isTemplateExpression(firstArg)) {
          const prefix = extractTemplatePrefix(firstArg)
          if (prefix) {
            usedPrefixes.add(prefix)
          }
        } else if (ts.isIdentifier(firstArg)) {
          const type = checker.getTypeAtLocation(firstArg)

          if (type.isUnion()) {
            let allLiterals = true
            for (const t of type.types) {
              if (t.isStringLiteral()) {
                usedKeys.add(t.value)
              } else {
                allLiterals = false
              }
            }
            if (!allLiterals) {
              const pos = sourceFile.getLineAndCharacterOfPosition(
                firstArg.getStart()
              )
              warnings.push(
                `${sourceFile.fileName}:${pos.line + 1}:${pos.character + 1} - Variable '${firstArg.text}' has non-literal string types`
              )
            }
          } else if (type.isStringLiteral()) {
            usedKeys.add(type.value)
          } else {
            const typeString = checker.typeToString(type)
            if (typeString !== 'string') {
              const pos = sourceFile.getLineAndCharacterOfPosition(
                firstArg.getStart()
              )
              warnings.push(
                `${sourceFile.fileName}:${pos.line + 1}:${pos.character + 1} - Variable '${firstArg.text}' has type '${typeString}' which cannot be statically analyzed`
              )
            }
          }
        } else if (ts.isPropertyAccessExpression(firstArg)) {
          const type = checker.getTypeAtLocation(firstArg)

          if (type.isStringLiteral()) {
            usedKeys.add(type.value)
          } else if (type.isUnion()) {
            for (const t of type.types) {
              if (t.isStringLiteral()) {
                usedKeys.add(t.value)
              }
            }
          }
        } else if (ts.isElementAccessExpression(firstArg)) {
          const type = checker.getTypeAtLocation(firstArg)

          if (type.isStringLiteral()) {
            usedKeys.add(type.value)
          } else if (type.isUnion()) {
            for (const t of type.types) {
              if (t.isStringLiteral()) {
                usedKeys.add(t.value)
              }
            }
          }
        }
      }
    }

    const transKey = getTransComponentI18nKey(node)
    if (transKey && ts.isStringLiteral(transKey)) {
      usedKeys.add(transKey.text)
    }

    ts.forEachChild(node, child => visitNode(child, sourceFile))
  }

  for (const sourceFile of program.getSourceFiles()) {
    if (
      !sourceFile.isDeclarationFile &&
      !sourceFile.fileName.includes('node_modules')
    ) {
      visitNode(sourceFile, sourceFile)
    }
  }

  return { usedKeys, usedPrefixes, warnings }
}

const loadEnglishLocale = async (): Promise<Locale> => {
  const enPath = path.resolve(currentDirname, '../locales/en.ts')
  const module = await import(enPath)
  return module.en
}

const serializeLocale = (locale: Locale, indent = 0): string => {
  const spaces = '  '.repeat(indent)
  const entries = Object.entries(locale)

  if (entries.length === 0) {
    return '{}'
  }

  const lines: string[] = ['{']

  entries.forEach(([key, value], index) => {
    const isLast = index === entries.length - 1
    const comma = isLast ? '' : ','

    const needsQuotes = !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
    const keyStr = needsQuotes ? `'${key}'` : key

    if (typeof value === 'string') {
      const escapedValue = value
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\n/g, '\\n')
      lines.push(`${spaces}  ${keyStr}: '${escapedValue}'${comma}`)
    } else {
      const nestedStr = serializeLocale(value, indent + 1)
      lines.push(`${spaces}  ${keyStr}: ${nestedStr}${comma}`)
    }
  })

  lines.push(`${spaces}}`)

  return lines.join('\n')
}

const writeEnglishLocale = (locale: Locale) => {
  const enPath = path.resolve(currentDirname, '../locales/en.ts')
  const content = `export const en = ${serializeLocale(locale)}\n`
  fs.writeFileSync(enPath, content)
  execSync(`npx prettier --write "${enPath}"`, { stdio: 'inherit' })
}

const main = async () => {
  const args = process.argv.slice(2)
  const shouldFix = args.includes('--fix')

  console.log('Analyzing translation usage...\n')

  const clientsDesktopDir = path.join(workspaceRoot, 'clients/desktop/src')
  const clientsExtensionDir = path.join(workspaceRoot, 'clients/extension/src')
  const coreDir = path.join(workspaceRoot, 'core')
  const libDir = path.join(workspaceRoot, 'lib')

  const sourceFiles = [
    ...(fs.existsSync(clientsDesktopDir)
      ? findSourceFiles(clientsDesktopDir)
      : []),
    ...findSourceFiles(clientsExtensionDir),
    ...findSourceFiles(coreDir),
    ...findSourceFiles(libDir),
  ].filter(
    f =>
      !f.includes('/i18n/scripts/') &&
      !f.includes('/locales/') &&
      !f.endsWith('.d.ts')
  )

  const { usedKeys, usedPrefixes, warnings } =
    analyzeTranslationUsage(sourceFiles)

  console.log(`✓ Found ${usedKeys.size} literal key usages`)
  console.log(
    `✓ Found ${usedPrefixes.size} template prefixes (auto-detected): ${[...usedPrefixes].join(', ') || 'none'}`
  )

  if (warnings.length > 0) {
    console.log(`\n⚠ ${warnings.length} warning(s):`)
    warnings.forEach(w => console.log(`  ${w}`))
  }

  const en = await loadEnglishLocale()
  const allKeys = flattenKeys(en)

  const unusedKeys = allKeys.filter(key => {
    if (usedKeys.has(key)) return false
    for (const prefix of usedPrefixes) {
      if (key.startsWith(prefix)) return false
    }
    return true
  })

  console.log(`\nTotal keys in en.ts: ${allKeys.length}`)

  if (unusedKeys.length === 0) {
    console.log('\n✓ No unused translation keys found!')
    process.exit(0)
  }

  console.log(`\nFound ${unusedKeys.length} unused translation key(s):`)
  unusedKeys.forEach(key => console.log(`  - ${key}`))

  if (shouldFix) {
    const localeCopy = JSON.parse(JSON.stringify(en)) as Locale

    for (const key of unusedKeys) {
      const keyPath = getKeyPath(key)
      removeKeyFromObject(localeCopy, keyPath)
    }

    writeEnglishLocale(localeCopy)
    console.log(`\n✓ Removed ${unusedKeys.length} unused keys from en.ts`)
  } else {
    console.log('\nRun with --fix to remove them.')
    process.exit(1)
  }
}

main()
