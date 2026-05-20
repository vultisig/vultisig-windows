import {
  createSourceFile,
  isIdentifier,
  isNoSubstitutionTemplateLiteral,
  isNumericLiteral,
  isObjectLiteralExpression,
  isPropertyAssignment,
  isStringLiteral,
  isVariableStatement,
  type ObjectLiteralExpression,
  type PropertyName,
  ScriptTarget,
} from 'typescript'

type TranslationRecord = {
  readonly [key: string]: string | TranslationRecord
}

type FlattenTranslationRecordInput = {
  record: TranslationRecord
  prefix?: string
}

type ReadTranslationRecordFromSourceInput = {
  source: string
  exportName: string
  fileName: string
}

const getPropertyNameText = (name: PropertyName): string => {
  if (isIdentifier(name) || isStringLiteral(name) || isNumericLiteral(name)) {
    return name.text
  }

  throw new Error(`Unsupported translation key syntax: ${name.getText()}`)
}

const readObjectLiteral = (
  expression: ObjectLiteralExpression
): TranslationRecord => {
  const result: Record<string, string | TranslationRecord> = {}

  expression.properties.forEach(property => {
    if (!isPropertyAssignment(property)) {
      throw new Error(
        `Unsupported translation property syntax: ${property.getText()}`
      )
    }

    const key = getPropertyNameText(property.name)
    const { initializer } = property

    if (
      isStringLiteral(initializer) ||
      isNoSubstitutionTemplateLiteral(initializer)
    ) {
      result[key] = initializer.text
      return
    }

    if (isObjectLiteralExpression(initializer)) {
      result[key] = readObjectLiteral(initializer)
      return
    }

    throw new Error(
      `Unsupported translation value for "${key}": ${initializer.getText()}`
    )
  })

  return result
}

export const flattenTranslationRecord = ({
  record,
  prefix = '',
}: FlattenTranslationRecordInput): Map<string, string> => {
  const result = new Map<string, string>()

  Object.entries(record).forEach(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'string') {
      result.set(path, value)
      return
    }

    flattenTranslationRecord({ record: value, prefix: path }).forEach(
      (nestedValue, nestedKey) => {
        result.set(nestedKey, nestedValue)
      }
    )
  })

  return result
}

export const readTranslationRecordFromSource = ({
  source,
  exportName,
  fileName,
}: ReadTranslationRecordFromSourceInput): TranslationRecord => {
  const sourceFile = createSourceFile(fileName, source, ScriptTarget.Latest)
  let result: TranslationRecord | undefined

  sourceFile.forEachChild(node => {
    if (!isVariableStatement(node)) {
      return
    }

    node.declarationList.declarations.forEach(declaration => {
      if (!isIdentifier(declaration.name)) {
        return
      }

      if (declaration.name.text !== exportName) {
        return
      }

      if (!declaration.initializer) {
        throw new Error(`${fileName}: export "${exportName}" has no value`)
      }

      if (!isObjectLiteralExpression(declaration.initializer)) {
        throw new Error(
          `${fileName}: export "${exportName}" is not an object literal`
        )
      }

      result = readObjectLiteral(declaration.initializer)
    })
  })

  if (!result) {
    throw new Error(`${fileName}: export "${exportName}" was not found`)
  }

  return result
}
