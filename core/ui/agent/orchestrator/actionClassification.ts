import type { BackendAction } from './types'

const alwaysAutoExecute: Record<string, boolean> = {
  add_chain: true,
  add_coin: true,
  remove_coin: true,
  remove_chain: true,
  address_book_add: true,
  address_book_remove: true,
  get_address_book: true,
  get_market_price: true,
  get_balances: true,
  get_portfolio: true,
  search_token: true,
  list_vaults: true,
  build_tx: true,
  build_send_tx: true,
  build_custom_tx: true,
  sign_tx: true,
  scan_tx: true,
}

function shouldAutoExecute(action: BackendAction): boolean {
  if (alwaysAutoExecute[action.type]) {
    return true
  }
  return action.auto_execute
}

export function filterAutoActions(actions: BackendAction[]): BackendAction[] {
  return actions.filter(shouldAutoExecute)
}

export function filterNonAutoActions(
  actions: BackendAction[]
): BackendAction[] {
  return actions.filter(a => !shouldAutoExecute(a))
}

export function filterBuildTx(
  actions: BackendAction[]
): [BackendAction[], BackendAction | null] {
  let build: BackendAction | null = null
  const remaining: BackendAction[] = []
  for (const a of actions) {
    if (
      a.type === 'build_tx' ||
      a.type === 'build_send_tx' ||
      a.type === 'build_custom_tx'
    ) {
      build = a
    } else {
      remaining.push(a)
    }
  }
  return [remaining, build]
}

export function filterSignTx(
  actions: BackendAction[]
): [BackendAction[], BackendAction | null] {
  let sign: BackendAction | null = null
  const remaining: BackendAction[] = []
  for (const a of actions) {
    if (a.type === 'sign_tx') {
      sign = a
    } else {
      remaining.push(a)
    }
  }
  return [remaining, sign]
}

const actionTypeToToolName: Record<string, string> = {
  address_book_add: 'add_address_book_entry',
  address_book_remove: 'remove_address_book_entry',
  create_policy: 'policy_add',
  delete_policy: 'policy_delete',
  build_tx: 'build_swap_tx',
  build_send_tx: 'build_send_tx',
  build_custom_tx: 'build_custom_tx',
}

export function resolveToolName(actionType: string): string {
  return actionTypeToToolName[actionType] ?? actionType
}

const passwordRequired: Record<string, boolean> = {
  plugin_install: true,
  create_policy: true,
  delete_policy: true,
  sign_tx: true,
}

const confirmationRequired: Record<string, boolean> = {
  plugin_install: true,
  create_policy: true,
  delete_policy: true,
}

export function needsPassword(actionType: string): boolean {
  return passwordRequired[actionType] === true
}

export function needsConfirmation(actionType: string): boolean {
  return confirmationRequired[actionType] === true
}
