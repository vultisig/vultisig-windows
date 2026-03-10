import type {
  AgentStep,
  AgentStepCategory,
  AgentStepIconType,
} from './TimelineEntry'

type StepConfig = { iconType: AgentStepIconType; category: AgentStepCategory }

const toolCallStepConfig: Record<string, StepConfig> = {
  get_balances: { iconType: 'wallet', category: 'balance' },
  get_portfolio: { iconType: 'wallet', category: 'balance' },
  get_full_portfolio: { iconType: 'wallet', category: 'balance' },
  fetch_balances: { iconType: 'wallet', category: 'balance' },
  search_token: { iconType: 'scanCube', category: 'planning' },
  get_market_price: { iconType: 'calculator', category: 'planning' },
  scan_tx: { iconType: 'scanCube', category: 'planning' },
  list_vaults: { iconType: 'noteText', category: 'planning' },
  get_address_book: { iconType: 'noteText', category: 'planning' },

  build_swap_tx: { iconType: 'proposalCube', category: 'proposing' },
  build_swap_transaction: { iconType: 'proposalCube', category: 'proposing' },
  build_send_tx: { iconType: 'proposalCube', category: 'proposing' },
  build_send_transaction: { iconType: 'proposalCube', category: 'proposing' },
  build_custom_tx: { iconType: 'buildingBlock', category: 'proposing' },
  build_custom_transaction: {
    iconType: 'buildingBlock',
    category: 'proposing',
  },

  sign_tx: { iconType: 'swapArrows', category: 'executing' },
  sign_transaction: { iconType: 'swapArrows', category: 'executing' },

  add_chain: { iconType: 'noteText', category: 'planning' },
  add_coin: { iconType: 'noteText', category: 'planning' },
  remove_coin: { iconType: 'noteText', category: 'planning' },
  remove_chain: { iconType: 'noteText', category: 'planning' },

  address_book_add: { iconType: 'noteText', category: 'planning' },
  address_book_remove: { iconType: 'noteText', category: 'planning' },

  mcp_status: { iconType: 'plugin', category: 'plugin' },
}

const defaultConfig: StepConfig = {
  iconType: 'noteText',
  category: 'planning',
}

const successTransitionCategories = new Set<AgentStepCategory>([
  'proposing',
  'executing',
])

export function shouldTransitionToSuccess(category: AgentStepCategory) {
  return successTransitionCategories.has(category)
}

export function toolCallToStep(
  actionId: string,
  actionType: string,
  title: string
): AgentStep {
  const config = toolCallStepConfig[actionType] ?? defaultConfig
  return {
    id: actionId,
    label: title || actionType.replace(/_/g, ' '),
    category: config.category,
    iconType: config.iconType,
    isActive: true,
  }
}
