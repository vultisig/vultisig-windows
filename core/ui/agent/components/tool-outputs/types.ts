export type ToolActionType = 'navigate' | 'copy' | 'openExternal'

export type ToolAction = {
  type: ToolActionType
  label: string
  value?: string
  url?: string
  navigation?: {
    id: string
    state?: Record<string, unknown>
  }
}

export type ToolOutputUI = {
  title?: string
  summary?: string
  actions?: ToolAction[]
}

export const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (typeof value !== 'object' || value === null) return null
  return value as Record<string, unknown>
}

export const readString = (
  record: Record<string, unknown>,
  ...keys: string[]
): string | undefined => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim().length > 0) {
      return value
    }
  }
  return undefined
}

export const readBoolean = (
  record: Record<string, unknown>,
  ...keys: string[]
): boolean | undefined => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'boolean') return value
  }
  return undefined
}

export const readNumber = (
  record: Record<string, unknown>,
  ...keys: string[]
): number | undefined => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'number') return value
  }
  return undefined
}
