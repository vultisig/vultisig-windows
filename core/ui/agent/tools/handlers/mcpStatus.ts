import type { ToolHandler } from '../types'

export const handleMcpStatus: ToolHandler = async input => {
  return { data: input as Record<string, unknown> }
}
