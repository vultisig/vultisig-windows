import { Eip712V4Payload } from '@core/inpage-provider/popup/interface'

export const isTypedDataRecord = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isFieldDeclaration = (
  field: unknown
): field is { name: string; type: string } =>
  isTypedDataRecord(field) &&
  typeof field.name === 'string' &&
  typeof field.type === 'string'

// Declaration order is the signed field order. Keep unexpected present fields
// visible too, without inventing values for absent declared fields.
export const getTypedDataFields = (
  value: Record<string, unknown>,
  type: string | undefined,
  types: Eip712V4Payload['types']
) => {
  const definition =
    type && Object.prototype.hasOwnProperty.call(types, type) ? types[type] : []
  const declared = Array.isArray(definition)
    ? definition.filter(isFieldDeclaration)
    : []
  const names = new Set(declared.map(field => field.name))
  return [
    ...declared
      .filter(field => Object.prototype.hasOwnProperty.call(value, field.name))
      .map(field => ({ ...field, value: value[field.name] })),
    ...Object.entries(value)
      .filter(([name]) => !names.has(name))
      .map(([name, value]) => ({ name, type: undefined, value })),
  ]
}
