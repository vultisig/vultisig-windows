import type { BackendAction } from './types'

export function filterProtectedActions(
  actions: BackendAction[]
): [BackendAction[], BackendAction[]] {
  const protected_: BackendAction[] = []
  const rest: BackendAction[] = []
  for (const a of actions) {
    if (passwordRequired[a.type] || confirmationRequired[a.type]) {
      protected_.push(a)
    } else {
      rest.push(a)
    }
  }
  return [rest, protected_]
}

export function filterDisplayOnly(
  actions: BackendAction[]
): [BackendAction[], BackendAction[]] {
  const display: BackendAction[] = []
  const rest: BackendAction[] = []
  for (const a of actions) {
    if (displayOnlyActions[a.type]) {
      display.push(a)
    } else {
      rest.push(a)
    }
  }
  return [rest, display]
}

export function filterAutoActions(actions: BackendAction[]): BackendAction[] {
  return actions
}

export function filterNonAutoActions(
  _actions: BackendAction[]
): BackendAction[] {
  return []
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

const displayOnlyActions: Record<string, boolean> = {
  mcp_status: true,
}

export function isDisplayOnly(actionType: string): boolean {
  return displayOnlyActions[actionType] === true
}
