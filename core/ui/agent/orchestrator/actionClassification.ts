import type { BackendAction } from './types'

const alwaysAutoExecute = new Set([
  'add_chain',
  'add_coin',
  'remove_coin',
  'remove_chain',
  'address_book_add',
  'address_book_remove',
  'get_address_book',
  'get_market_price',
  'get_balances',
  'get_portfolio',
  'search_token',
  'list_vaults',
  'plugin_list',
  'plugin_spec',
  'plugin_installed',
  'plugin_uninstall',
  'build_swap_tx',
  'build_send_tx',
  'build_custom_tx',
  'mcp_status',
  'sign_tx',
  'sign_typed_data',
  'read_evm_contract',
  'scan_tx',
  'thorchain_query',
])

const shouldAutoExecute = (action: BackendAction): boolean =>
  alwaysAutoExecute.has(action.type) || action.auto_execute

export function filterProtectedActions(
  actions: BackendAction[]
): [BackendAction[], BackendAction[]] {
  const protected_: BackendAction[] = []
  const rest: BackendAction[] = []
  for (const a of actions) {
    const isProtected =
      (passwordRequired.has(a.type) || confirmationRequired.has(a.type)) &&
      !alwaysAutoExecute.has(a.type)
    if (isProtected) {
      protected_.push(a)
    } else {
      rest.push(a)
    }
  }
  return [rest, protected_]
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
      a.type === 'build_swap_tx' ||
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
  build_swap_tx: 'build_swap_tx',
  build_send_tx: 'build_send_tx',
  build_custom_tx: 'build_custom_tx',
}

export function resolveToolName(actionType: string): string {
  return actionTypeToToolName[actionType] ?? actionType
}

const passwordRequired = new Set([
  'plugin_install',
  'create_policy',
  'delete_policy',
  'sign_tx',
  'sign_typed_data',
])

const confirmationRequired = new Set([
  'plugin_install',
  'create_policy',
  'delete_policy',
])

export const needsPassword = (actionType: string): boolean =>
  passwordRequired.has(actionType)

export const needsConfirmation = (actionType: string): boolean =>
  confirmationRequired.has(actionType)
