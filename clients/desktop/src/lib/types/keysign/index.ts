type KeysignActionFees =
  | { type: 'send'; networkFeesFormatted: string; totalFeesFormatted?: string }
  | { type: 'swap'; totalFeesFormatted: string }

export type SendFees = Extract<KeysignActionFees, { type: 'send' }>
