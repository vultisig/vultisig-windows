import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'

import { BackgroundMessage } from '../background/resolver'
import { PopupMessage } from '../popup/resolver'

type AccountHintMessage =
  | { background: Pick<BackgroundMessage, 'options'> }
  | { popup: Pick<PopupMessage, 'options'> }

/**
 * The address a provider named for this call (e.g. the `from` of a sign
 * request). Authorization uses it to pick the vault that owns the address
 * instead of assuming the current one; the session is still read from
 * storage for the trusted origin, so it cannot widen access.
 */
export const getBridgeMessageAccount = (
  message: AccountHintMessage
): string | undefined =>
  matchRecordUnion<AccountHintMessage, string | undefined>(message, {
    background: ({ options }) => options?.account,
    popup: ({ options }) => options.account,
  })
