export type AgentStepCategory =
  | 'planning'
  | 'proposing'
  | 'executing'
  | 'success'
  | 'error'
  | 'recurring'
  | 'plugin'
  | 'balance'
  | 'history'

export type AgentStepIconType =
  | 'loader'
  | 'noteText'
  | 'scroll'
  | 'calculator'
  | 'scanCube'
  | 'buildingBlock'
  | 'proposalCube'
  | 'check'
  | 'wallet'
  | 'arrowUp'
  | 'swapArrows'
  | 'chatNotification'
  | 'plugin'
  | 'historyRefresh'
  | 'warning'

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
