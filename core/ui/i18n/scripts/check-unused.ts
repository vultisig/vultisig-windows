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

const analyzeTranslationUsage = (
  sourceFiles: string[]
): {
  usedKeys: Set<string>
  usedPrefixes: Set<string>
  usedSuffixes: Set<string>
  warnings: string[]
} => {
  const usedKeys = new Set<string>()
  const usedPrefixes = new Set<string>()
  const usedSuffixes = new Set<string>()
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

  const addKeyWithPlurals = (key: string, hasCount: boolean) => {
    usedKeys.add(key)
    if (hasCount) {
      usedKeys.add(`${key}_one`)
      usedKeys.add(`${key}_other`)
    }
  }

  const handleStringLiteral = (
    node: ts.Node,
    text: string,
    hasCount: boolean
  ) => {
    addKeyWithPlurals(text, hasCount)
  }

  const handleTemplateExpression = (node: ts.TemplateExpression) => {
    const prefix = node.head.text
    if (prefix) {
      usedPrefixes.add(prefix)
    }
    const lastSpan = node.templateSpans[node.templateSpans.length - 1]
    if (lastSpan) {
      const suffix = lastSpan.literal.text
      if (suffix) {
        usedSuffixes.add(suffix)
      }
    }
  }

  const visitNode = (node: ts.Node, sourceFile: ts.SourceFile) => {
    if (ts.isStringLiteral(node)) {
      usedKeys.add(node.text)
    } else if (ts.isNoSubstitutionTemplateLiteral(node)) {
      usedKeys.add(node.text)
    }

    if (isTFunctionCall(node)) {
      const args = node.arguments
      if (args.length > 0) {
        const firstArg = args[0]
        const secondArg = args[1]
        let hasCount = false

        if (secondArg && ts.isObjectLiteralExpression(secondArg)) {
          hasCount = secondArg.properties.some(
            p =>
              ts.isPropertyAssignment(p) &&
              ts.isIdentifier(p.name) &&
              p.name.text === 'count'
          )
        }

        if (ts.isStringLiteral(firstArg)) {
          handleStringLiteral(firstArg, firstArg.text, hasCount)
        } else if (ts.isNoSubstitutionTemplateLiteral(firstArg)) {
          handleStringLiteral(firstArg, firstArg.text, hasCount)
        } else if (ts.isTemplateExpression(firstArg)) {
          handleTemplateExpression(firstArg)
        } else if (ts.isConditionalExpression(firstArg)) {
          if (ts.isStringLiteral(firstArg.whenTrue)) {
            handleStringLiteral(
              firstArg.whenTrue,
              firstArg.whenTrue.text,
              false
            )
          }
          if (ts.isStringLiteral(firstArg.whenFalse)) {
            handleStringLiteral(
              firstArg.whenFalse,
              firstArg.whenFalse.text,
              false
            )
          }
        } else if (ts.isIdentifier(firstArg)) {
          const type = checker.getTypeAtLocation(firstArg)

          if (type.isUnion()) {
            let allLiterals = true
            for (const t of type.types) {
              if (t.isStringLiteral()) {
                addKeyWithPlurals(t.value, hasCount)
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
            addKeyWithPlurals(type.value, hasCount)
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
            addKeyWithPlurals(type.value, hasCount)
          } else if (type.isUnion()) {
            for (const t of type.types) {
              if (t.isStringLiteral()) {
                addKeyWithPlurals(t.value, hasCount)
              }
            }
          }
        } else if (ts.isElementAccessExpression(firstArg)) {
          const type = checker.getTypeAtLocation(firstArg)

          if (type.isStringLiteral()) {
            addKeyWithPlurals(type.value, hasCount)
          } else if (type.isUnion()) {
            for (const t of type.types) {
              if (t.isStringLiteral()) {
                addKeyWithPlurals(t.value, hasCount)
              }
            }
          }
        }
      }
    }

    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const tagName = node.tagName
      if (ts.isIdentifier(tagName) && tagName.text === 'Trans') {
        for (const attr of node.attributes.properties) {
          if (
            ts.isJsxAttribute(attr) &&
            ts.isIdentifier(attr.name) &&
            attr.name.text === 'i18nKey'
          ) {
            const initializer = attr.initializer
            if (initializer && ts.isJsxExpression(initializer)) {
              const expr = initializer.expression
              if (expr) {
                if (ts.isStringLiteral(expr)) {
                  usedKeys.add(expr.text)
                } else if (ts.isTemplateExpression(expr)) {
                  handleTemplateExpression(expr)
                } else if (ts.isConditionalExpression(expr)) {
                  if (ts.isStringLiteral(expr.whenTrue)) {
                    usedKeys.add(expr.whenTrue.text)
                  }
                  if (ts.isStringLiteral(expr.whenFalse)) {
                    usedKeys.add(expr.whenFalse.text)
                  }
                }
              }
            } else if (initializer && ts.isStringLiteral(initializer)) {
              usedKeys.add(initializer.text)
            }
          }
        }
      }
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

  return { usedKeys, usedPrefixes, usedSuffixes, warnings }
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

  const { usedKeys, usedPrefixes, usedSuffixes, warnings } =
    analyzeTranslationUsage(sourceFiles)

  console.log(`✓ Found ${usedKeys.size} literal key usages`)
  console.log(
    `✓ Found ${usedPrefixes.size} template prefixes: ${[...usedPrefixes].join(', ') || 'none'}`
  )
  console.log(
    `✓ Found ${usedSuffixes.size} template suffixes: ${[...usedSuffixes].join(', ') || 'none'}`
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
    for (const suffix of usedSuffixes) {
      if (key.endsWith(suffix)) return false
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
