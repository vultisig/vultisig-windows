/**
 * Static labels for Sui framework singletons and standard-library entry
 * points. These are immutable identifiers / addresses defined by the Sui
 * framework itself, so they never need an RPC roundtrip to resolve.
 */

const pad32 = (hex: string): string =>
  '0x' + hex.replace(/^0x/, '').padStart(64, '0').toLowerCase()

// Sui system singletons. The user always sees these in DeFi PTBs.
const knownSuiObjects: Record<string, string> = {
  [pad32('0x5')]: 'SuiSystemState',
  [pad32('0x6')]: 'Clock',
  [pad32('0x8')]: 'Random',
  [pad32('0x403')]: 'DenyList',
}

// Friendly names + parameter labels for the most common framework calls.
// Keys are `{package}::{module}::{function}`. Package addresses are kept full
// so future packages don't accidentally collide.
type ModuleEntry = { label: string; params?: string[] }

const sui = pad32('0x2')

const knownSuiModuleCalls: Record<string, ModuleEntry> = {
  [`${sui}::coin::zero`]: { label: 'Create empty Coin' },
  [`${sui}::coin::value`]: { label: 'Read Coin value' },
  [`${sui}::coin::split`]: { label: 'Split Coin', params: ['coin', 'amount'] },
  [`${sui}::coin::join`]: {
    label: 'Merge Coins',
    params: ['destination', 'source'],
  },
  [`${sui}::coin::from_balance`]: { label: 'Wrap Balance in Coin' },
  [`${sui}::coin::into_balance`]: { label: 'Unwrap Coin to Balance' },
  [`${sui}::coin::destroy_zero`]: { label: 'Destroy empty Coin' },
  [`${sui}::balance::value`]: { label: 'Read Balance value' },
  [`${sui}::balance::zero`]: { label: 'Create empty Balance' },
  [`${sui}::balance::join`]: {
    label: 'Merge Balances',
    params: ['destination', 'source'],
  },
  [`${sui}::balance::split`]: {
    label: 'Split Balance',
    params: ['balance', 'amount'],
  },
  [`${sui}::balance::destroy_zero`]: { label: 'Destroy empty Balance' },
  [`${sui}::clock::timestamp_ms`]: { label: 'Read on-chain timestamp' },
  [`${sui}::transfer::public_transfer`]: {
    label: 'Transfer object',
    params: ['object', 'recipient'],
  },
  [`${sui}::transfer::public_share_object`]: { label: 'Share object' },
  [`${sui}::transfer::public_freeze_object`]: { label: 'Freeze object' },
  [`${sui}::transfer::transfer`]: {
    label: 'Transfer object',
    params: ['object', 'recipient'],
  },
  [`${sui}::transfer::share_object`]: { label: 'Share object' },
}

const normalisePackageId = (pkg: string): string => pad32(pkg)

export const knownObjectLabel = (objectId: string): string | undefined =>
  knownSuiObjects[pad32(objectId)]

export const knownMoveCallEntry = (
  pkg: string,
  module: string,
  fn: string
): ModuleEntry | undefined =>
  knownSuiModuleCalls[`${normalisePackageId(pkg)}::${module}::${fn}`]
