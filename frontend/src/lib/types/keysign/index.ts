export type KeysignActionFees =
  | { type: 'send'; networkFeesFormatted: string; totalFeesFormatted?: string }
  | { type: 'swap'; totalFeesFormatted: string };

export type KeysignActionFeeValue = KeysignActionFees;
export type SendFees = Extract<KeysignActionFees, { type: 'send' }>;
export type SwapFees = Extract<KeysignActionFees, { type: 'swap' }>;
