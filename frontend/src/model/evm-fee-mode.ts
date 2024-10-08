// Define an enum for the FeeMode
export enum FeeMode {
  SafeLow = 'safeLow',
  Normal = 'normal',
  Fast = 'fast',
}

// Define the return type for fetchMaxPriorityFeesPerGas
export type FeeMap = Record<FeeMode, number>;
