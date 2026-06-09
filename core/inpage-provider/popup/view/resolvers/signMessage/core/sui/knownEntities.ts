/**
 * i18n keys for Sui framework singletons and standard-library entry points.
 * These are immutable identifiers / addresses defined by the Sui framework
 * itself, so they never need an RPC roundtrip to resolve. Callers resolve
 * each key through `useTranslation()` at render time — the static map only
 * stores the key, not the displayed string.
 */

const pad32 = (hex: string): string =>
  '0x' + hex.replace(/^0x/, '').padStart(64, '0').toLowerCase()

// `as const` keeps the value type narrowed to its literal so that the literal
// reaches `t()` directly — no assertion needed at the call site.
const knownSuiObjectKeys = {
  '0x0000000000000000000000000000000000000000000000000000000000000005':
    'sui_object_sui_system_state',
  '0x0000000000000000000000000000000000000000000000000000000000000006':
    'sui_object_clock',
  '0x0000000000000000000000000000000000000000000000000000000000000008':
    'sui_object_random',
  '0x0000000000000000000000000000000000000000000000000000000000000403':
    'sui_object_deny_list',
} as const

type SuiKnownObjectKey =
  (typeof knownSuiObjectKeys)[keyof typeof knownSuiObjectKeys]

// i18n keys for the most common framework calls. Map keys are
// `{package}::{module}::{function}`; values are entries holding the
// i18n keys for the friendly label and (optionally) parameter names.
// Package addresses are kept full so future packages can't accidentally
// collide.
const sui = pad32('0x2')

const knownSuiModuleCallKeys = {
  [`${sui}::coin::zero`]: { labelKey: 'sui_call_coin_zero' },
  [`${sui}::coin::value`]: { labelKey: 'sui_call_coin_value' },
  [`${sui}::coin::split`]: {
    labelKey: 'sui_call_coin_split',
    paramKeys: ['sui_param_coin', 'sui_param_amount'],
  },
  [`${sui}::coin::join`]: {
    labelKey: 'sui_call_coin_join',
    paramKeys: ['sui_param_destination', 'sui_param_source'],
  },
  [`${sui}::coin::from_balance`]: { labelKey: 'sui_call_coin_from_balance' },
  [`${sui}::coin::into_balance`]: { labelKey: 'sui_call_coin_into_balance' },
  [`${sui}::coin::destroy_zero`]: { labelKey: 'sui_call_coin_destroy_zero' },
  [`${sui}::balance::value`]: { labelKey: 'sui_call_balance_value' },
  [`${sui}::balance::zero`]: { labelKey: 'sui_call_balance_zero' },
  [`${sui}::balance::join`]: {
    labelKey: 'sui_call_balance_join',
    paramKeys: ['sui_param_destination', 'sui_param_source'],
  },
  [`${sui}::balance::split`]: {
    labelKey: 'sui_call_balance_split',
    paramKeys: ['sui_param_balance', 'sui_param_amount'],
  },
  [`${sui}::balance::destroy_zero`]: {
    labelKey: 'sui_call_balance_destroy_zero',
  },
  [`${sui}::clock::timestamp_ms`]: { labelKey: 'sui_call_clock_timestamp_ms' },
  [`${sui}::transfer::public_transfer`]: {
    labelKey: 'sui_call_transfer_transfer',
    paramKeys: ['sui_param_object', 'sui_param_recipient'],
  },
  [`${sui}::transfer::public_share_object`]: {
    labelKey: 'sui_call_transfer_share_object',
  },
  [`${sui}::transfer::public_freeze_object`]: {
    labelKey: 'sui_call_transfer_freeze_object',
  },
  [`${sui}::transfer::transfer`]: {
    labelKey: 'sui_call_transfer_transfer',
    paramKeys: ['sui_param_object', 'sui_param_recipient'],
  },
  [`${sui}::transfer::share_object`]: {
    labelKey: 'sui_call_transfer_share_object',
  },
} as const

type ModuleEntry = {
  labelKey: SuiCallLabelKey
  paramKeys?: readonly SuiParamKey[]
}

type SuiCallLabelKey =
  (typeof knownSuiModuleCallKeys)[keyof typeof knownSuiModuleCallKeys]['labelKey']

type SuiParamKey = NonNullable<
  (typeof knownSuiModuleCallKeys)[keyof typeof knownSuiModuleCallKeys]['paramKeys']
>[number]

const normalisePackageId = (pkg: string): string => pad32(pkg)

export const knownObjectLabelKey = (
  objectId: string
): SuiKnownObjectKey | undefined => {
  const padded = pad32(objectId)
  if (padded in knownSuiObjectKeys) {
    return knownSuiObjectKeys[padded as keyof typeof knownSuiObjectKeys]
  }
  return undefined
}

export const knownMoveCallEntry = (
  pkg: string,
  module: string,
  fn: string
): ModuleEntry | undefined => {
  const key = `${normalisePackageId(pkg)}::${module}::${fn}`
  if (key in knownSuiModuleCallKeys) {
    return knownSuiModuleCallKeys[key as keyof typeof knownSuiModuleCallKeys]
  }
  return undefined
}
