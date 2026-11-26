/**
 * One saved churn: when it landed, and what it paid the bond address in base
 * units as a decimal string (storage cannot hold bigints), or null when the
 * address was not a bond provider on the node then.
 */
export type SavedBondRewardRow = {
  date: number
  amount: string | null
}

/** One bond provider's saved churns on one node, keyed by churn height. */
export type SavedBondRewardRows = Record<string, SavedBondRewardRow>

/** Every saved bond reward history, keyed by chain, node and bond address. */
export type SavedBondRewardHistories = Partial<
  Record<string, SavedBondRewardRows>
>

type GetBondRewardHistoriesFunction = () => Promise<SavedBondRewardHistories>

type SetBondRewardHistoriesFunction = (
  histories: SavedBondRewardHistories
) => Promise<void>

/**
 * Per-client persistence of every bond reward loaded so far. Nodes keep only
 * recent state, so this copy is the only source for older churns and grows
 * as the user keeps coming back. Implemented by the desktop
 * (`persistentStorage`) and extension (`chrome.storage`) storage layers.
 */
export type BondRewardHistoryStorage = {
  getBondRewardHistories: GetBondRewardHistoriesFunction
  setBondRewardHistories: SetBondRewardHistoriesFunction
}
