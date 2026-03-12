export const agentStepCategories = [
  'planning',
  'proposing',
  'executing',
  'success',
  'error',
  'recurring',
  'plugin',
  'balance',
  'history',
] as const

export type AgentStepCategory = (typeof agentStepCategories)[number]

export const agentStepIconTypes = [
  'loader',
  'noteText',
  'scroll',
  'calculator',
  'scanCube',
  'buildingBlock',
  'proposalCube',
  'check',
  'wallet',
  'arrowUp',
  'swapArrows',
  'chatNotification',
  'plugin',
  'historyRefresh',
  'warning',
] as const

export type AgentStepIconType = (typeof agentStepIconTypes)[number]

export type AgentStep = {
  id: string
  label: string
  description?: string
  category: AgentStepCategory
  iconType: AgentStepIconType
  isActive?: boolean
}

export type TimelineEntry =
  | ({ kind: 'step' } & AgentStep)
  | { kind: 'content'; text: string }
