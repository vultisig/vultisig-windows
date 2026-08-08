import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'

import { Language, languages, primaryLanguage } from '../Language'
import { translations } from '../translations'
import { flattenTranslationRecord } from '../utils/translationRecords'

type Locale = {
  [key: string]: string | Locale
}

type DynamicKeyPattern = {
  prefix: string
  suffix: string
}

type TranslationUsage = {
  usedKeys: Set<string>
  dynamicPatterns: DynamicKeyPattern[]
  warnings: string[]
}

const currentDirname = dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(currentDirname, '../../../..')
const localeDirectory = path.resolve(currentDirname, '../locales')

const ignoredDirectoryNames = new Set([
  'node_modules',
  'dist',
  '.git',
  'generated',
])

const getKeyPath = (key: string): string[] => key.split('.')

const removeKeyFromObject = (obj: Locale, keyPath: string[]): boolean => {
  const [first, ...rest] = keyPath

  if (!first) {
    return false
  }

  if (rest.length === 0) {
    if (first in obj) {
      delete obj[first]
      return true
    }

    return false
  }

  const nested = obj[first]

  if (typeof nested !== 'object' || nested === null) {
    return false
  }

  const removed = removeKeyFromObject(nested, rest)

  if (removed && Object.keys(nested).length === 0) {
    delete obj[first]
  }

  return removed
}

const cloneLocale = (locale: Locale): Locale => {
  const result: Locale = {}

  Object.entries(locale).forEach(([key, value]) => {
    result[key] = typeof value === 'string' ? value : cloneLocale(value)
  })

  return result
}

const findSourceFiles = (dir: string): string[] => {
  const results: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (ignoredDirectoryNames.has(entry.name)) {
        continue
      }

      results.push(...findSourceFiles(fullPath))
      continue
    }

    if (!entry.isFile()) {
      continue
    }

    if (
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
      !entry.name.endsWith('.d.ts')
    ) {
      results.push(fullPath)
    }
  }

  return results
}

const isTranslationFunctionCall = (
  node: ts.Node
): node is ts.CallExpression => {
  if (!ts.isCallExpression(node)) {
    return false
  }

  const { expression } = node

  return (
    ts.isIdentifier(expression) &&
    (expression.text === 't' || expression.text === 'translate')
  )
}

const getLocation = (sourceFile: ts.SourceFile, node: ts.Node): string => {
  const position = sourceFile.getLineAndCharacterOfPosition(
    node.getStart(sourceFile)
  )
  const filePath = path.relative(workspaceRoot, sourceFile.fileName)

  return `${filePath}:${position.line + 1}:${position.character + 1}`
}

const getStringLiteralValues = (type: ts.Type): string[] | undefined => {
  if (type.isStringLiteral()) {
    return [type.value]
  }

  if (!type.isUnion()) {
    return undefined
  }

  const values: string[] = []

  for (const unionType of type.types) {
    if (unionType.isStringLiteral()) {
      values.push(unionType.value)
      continue
    }

    if (
      (unionType.flags & ts.TypeFlags.Undefined) !== 0 ||
      (unionType.flags & ts.TypeFlags.Null) !== 0
    ) {
      continue
    }

    return undefined
  }

  return values.length > 0 ? values : undefined
}

const addKeyWithPlurals = ({
  usedKeys,
  key,
  hasCount,
}: {
  usedKeys: Set<string>
  key: string
  hasCount: boolean
}) => {
  usedKeys.add(key)

  if (hasCount) {
    usedKeys.add(`${key}_one`)
    usedKeys.add(`${key}_other`)
  }
}

const hasCountOption = (node: ts.Expression | undefined): boolean => {
  if (!node || !ts.isObjectLiteralExpression(node)) {
    return false
  }

  return node.properties.some(
    property =>
      ts.isPropertyAssignment(property) &&
      ts.isIdentifier(property.name) &&
      property.name.text === 'count'
  )
}

const hasDefaultValueOption = (node: ts.Expression | undefined): boolean => {
  if (!node || !ts.isObjectLiteralExpression(node)) {
    return false
  }

  return node.properties.some(
    property =>
      ts.isPropertyAssignment(property) &&
      ts.isIdentifier(property.name) &&
      property.name.text === 'defaultValue'
  )
}

const getTemplatePattern = (
  node: ts.TemplateExpression
): DynamicKeyPattern | undefined => {
  const prefix = node.head.text
  const lastSpan = node.templateSpans[node.templateSpans.length - 1]
  const suffix = lastSpan?.literal.text ?? ''

  if (!prefix && !suffix) {
    return undefined
  }

  return { prefix, suffix }
}

const getPatternLabel = ({ prefix, suffix }: DynamicKeyPattern): string =>
  `${prefix}*${suffix}`

const addDynamicPattern = ({
  dynamicPatterns,
  pattern,
}: {
  dynamicPatterns: DynamicKeyPattern[]
  pattern: DynamicKeyPattern
}) => {
  const label = getPatternLabel(pattern)

  if (
    !dynamicPatterns.some(
      existingPattern => getPatternLabel(existingPattern) === label
    )
  ) {
    dynamicPatterns.push(pattern)
  }
}

const addExpressionKeys = ({
  expression,
  checker,
  sourceFile,
  usedKeys,
  dynamicPatterns,
  warnings,
  hasCount,
  warnOnUnresolved,
}: {
  expression: ts.Expression
  checker: ts.TypeChecker
  sourceFile: ts.SourceFile
  usedKeys: Set<string>
  dynamicPatterns: DynamicKeyPattern[]
  warnings: string[]
  hasCount: boolean
  warnOnUnresolved: boolean
}) => {
  if (
    ts.isStringLiteral(expression) ||
    ts.isNoSubstitutionTemplateLiteral(expression)
  ) {
    addKeyWithPlurals({ usedKeys, key: expression.text, hasCount })
    return
  }

  if (ts.isTemplateExpression(expression)) {
    const values = getStringLiteralValues(checker.getTypeAtLocation(expression))

    if (values) {
      values.forEach(key => addKeyWithPlurals({ usedKeys, key, hasCount }))
      return
    }

    const pattern = getTemplatePattern(expression)

    if (pattern) {
      addDynamicPattern({ dynamicPatterns, pattern })
      return
    }
  }

  if (ts.isConditionalExpression(expression)) {
    addExpressionKeys({
      expression: expression.whenTrue,
      checker,
      sourceFile,
      usedKeys,
      dynamicPatterns,
      warnings,
      hasCount,
      warnOnUnresolved,
    })
    addExpressionKeys({
      expression: expression.whenFalse,
      checker,
      sourceFile,
      usedKeys,
      dynamicPatterns,
      warnings,
      hasCount,
      warnOnUnresolved,
    })
    return
  }

  if (
    ts.isParenthesizedExpression(expression) ||
    ts.isNonNullExpression(expression)
  ) {
    addExpressionKeys({
      expression: expression.expression,
      checker,
      sourceFile,
      usedKeys,
      dynamicPatterns,
      warnings,
      hasCount,
      warnOnUnresolved,
    })
    return
  }

  if (ts.isAsExpression(expression) || ts.isSatisfiesExpression(expression)) {
    addExpressionKeys({
      expression: expression.expression,
      checker,
      sourceFile,
      usedKeys,
      dynamicPatterns,
      warnings,
      hasCount,
      warnOnUnresolved,
    })
    return
  }

  const type = checker.getTypeAtLocation(expression)
  const values = getStringLiteralValues(type)

  if (values) {
    values.forEach(key => addKeyWithPlurals({ usedKeys, key, hasCount }))
    return
  }

  if (warnOnUnresolved) {
    warnings.push(
      `${getLocation(sourceFile, expression)} - Dynamic translation key could not be resolved statically (type: ${checker.typeToString(type)})`
    )
  }
}

const readTransI18nKey = (node: ts.JsxOpeningLikeElement): ts.Expression[] => {
  const expressions: ts.Expression[] = []

  for (const attr of node.attributes.properties) {
    if (
      !ts.isJsxAttribute(attr) ||
      !ts.isIdentifier(attr.name) ||
      attr.name.text !== 'i18nKey'
    ) {
      continue
    }

    const { initializer } = attr

    if (!initializer) {
      continue
    }

    if (ts.isStringLiteral(initializer)) {
      expressions.push(initializer)
      continue
    }

    if (ts.isJsxExpression(initializer) && initializer.expression) {
      expressions.push(initializer.expression)
    }
  }

  return expressions
}

const analyzeTranslationUsage = (sourceFiles: string[]): TranslationUsage => {
  const usedKeys = new Set<string>()
  const dynamicPatterns: DynamicKeyPattern[] = []
  const warnings: string[] = []
  const configPath = path.join(workspaceRoot, 'tsconfig.json')
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile)

  if (configFile.error) {
    throw new Error(
      ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n')
    )
  }

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
  const sourceFileNames = new Set(sourceFiles.map(file => path.resolve(file)))

  const visitNode = (node: ts.Node, sourceFile: ts.SourceFile) => {
    if (isTranslationFunctionCall(node)) {
      const firstArg = node.arguments[0]

      if (firstArg) {
        const options = node.arguments[1]

        addExpressionKeys({
          expression: firstArg,
          checker,
          sourceFile,
          usedKeys,
          dynamicPatterns,
          warnings,
          hasCount: hasCountOption(options),
          warnOnUnresolved: !hasDefaultValueOption(options),
        })
      }
    }

    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const { tagName } = node

      if (ts.isIdentifier(tagName) && tagName.text === 'Trans') {
        readTransI18nKey(node).forEach(expression => {
          addExpressionKeys({
            expression,
            checker,
            sourceFile,
            usedKeys,
            dynamicPatterns,
            warnings,
            hasCount: false,
            warnOnUnresolved: true,
          })
        })
      }
    }

    ts.forEachChild(node, child => visitNode(child, sourceFile))
  }

  program.getSourceFiles().forEach(sourceFile => {
    if (!sourceFileNames.has(path.resolve(sourceFile.fileName))) {
      return
    }

    visitNode(sourceFile, sourceFile)
  })

  return { usedKeys, dynamicPatterns, warnings }
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
    const keyString = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`

    if (typeof value === 'string') {
      const escapedValue = value
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n')

      lines.push(`${spaces}  ${keyString}: '${escapedValue}'${comma}`)
      return
    }

    lines.push(
      `${spaces}  ${keyString}: ${serializeLocale(value, indent + 1)}${comma}`
    )
  })

  lines.push(`${spaces}}`)

  return lines.join('\n')
}

const writeLocale = ({
  language,
  locale,
}: {
  language: Language
  locale: Locale
}) => {
  const filePath = path.join(localeDirectory, `${language}.ts`)
  const content = `export const ${language} = ${serializeLocale(locale)}\n`

  fs.writeFileSync(filePath, content)
  execFileSync('npx', ['prettier', '--write', filePath], {
    cwd: workspaceRoot,
    stdio: 'inherit',
  })
}

const getSourceFiles = (): string[] => {
  const clientsDesktopDir = path.join(workspaceRoot, 'clients/desktop/src')
  const clientsExtensionDir = path.join(workspaceRoot, 'clients/extension/src')
  const coreDir = path.join(workspaceRoot, 'core')
  const libDir = path.join(workspaceRoot, 'lib')

  return [
    ...(fs.existsSync(clientsDesktopDir)
      ? findSourceFiles(clientsDesktopDir)
      : []),
    ...(fs.existsSync(clientsExtensionDir)
      ? findSourceFiles(clientsExtensionDir)
      : []),
    ...findSourceFiles(coreDir),
    ...findSourceFiles(libDir),
  ].filter(
    filePath =>
      !filePath.includes('/i18n/scripts/') &&
      !filePath.includes('/i18n/locales/') &&
      !filePath.endsWith('.d.ts')
  )
}

const isUsedByDynamicPattern = ({
  key,
  dynamicPatterns,
}: {
  key: string
  dynamicPatterns: DynamicKeyPattern[]
}): boolean =>
  dynamicPatterns.some(({ prefix, suffix }) => {
    if (!prefix && !suffix) {
      return false
    }

    return key.startsWith(prefix) && key.endsWith(suffix)
  })

const fixUnusedKeys = (unusedKeys: string[]) => {
  languages.forEach(language => {
    const locale = cloneLocale(translations[language])
    let removedCount = 0

    unusedKeys.forEach(key => {
      if (removeKeyFromObject(locale, getKeyPath(key))) {
        removedCount += 1
      }
    })

    if (removedCount > 0) {
      writeLocale({ language, locale })
      console.log(`Removed ${removedCount} unused key(s) from ${language}.ts`)
    }
  })
}

const main = () => {
  const args = process.argv.slice(2)
  const shouldFix = args.includes('--fix')

  console.log('Analyzing translation usage...\n')

  const { usedKeys, dynamicPatterns, warnings } =
    analyzeTranslationUsage(getSourceFiles())
  const sourceTranslations = flattenTranslationRecord({
    record: translations[primaryLanguage],
  })
  const dynamicPatternLabels = dynamicPatterns.map(getPatternLabel)

  console.log(`Found ${usedKeys.size} statically resolved key usage(s)`)
  console.log(
    `Found ${dynamicPatternLabels.length} dynamic key pattern(s): ${dynamicPatternLabels.join(', ') || 'none'}`
  )

  if (warnings.length > 0) {
    console.log(`\nFound ${warnings.length} unresolved dynamic key usage(s):`)
    warnings.forEach(warning => console.log(`  - ${warning}`))
  }

  const unusedKeys = Array.from(sourceTranslations.keys()).filter(key => {
    if (usedKeys.has(key)) {
      return false
    }

    return !isUsedByDynamicPattern({ key, dynamicPatterns })
  })

  console.log(
    `\nTotal keys in ${primaryLanguage}.ts: ${sourceTranslations.size}`
  )

  if (unusedKeys.length === 0) {
    console.log('\nNo unused translation keys found.')
    return
  }

  console.log(`\nFound ${unusedKeys.length} unused translation key(s):`)
  unusedKeys.forEach(key => console.log(`  - ${key}`))

  if (!shouldFix) {
    console.log('\nRun with --fix to remove them from every locale.')
    process.exitCode = 1
    return
  }

  fixUnusedKeys(unusedKeys)
}

main()
