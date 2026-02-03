// Base type shared by both vault types
export type SecureVaultCreationInput = {
  name: string
  referral?: string
}

// Fast vault extends secure with additional fields
export type FastVaultCreationInput = SecureVaultCreationInput & {
  email: string
  password: string
  hint?: string
}

// Record union pattern (matches existing KeygenOperation pattern)
// Only fast and secure - other flows don't collect creation input
export type VaultCreationInput =
  | { fast: FastVaultCreationInput }
  | { secure: SecureVaultCreationInput }
