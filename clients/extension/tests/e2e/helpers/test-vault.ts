/**
 * Test Vault Helper Functions
 *
 * Utilities for loading test vaults in E2E tests.
 * Mirrors the SDK's test-vault.ts pattern for consistency.
 */

import { config } from 'dotenv'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Load .env from e2e directory
const envPath = resolve(__dirname, '../.env')
if (existsSync(envPath)) {
  config({ path: envPath })
  console.log('✅ Loaded .env file from:', envPath)
} else {
  console.log('ℹ️  No .env file found at', envPath)
  console.log('   Copy .env.example to .env and configure your test vault')
}

/**
 * Test vault configuration from environment
 */
export const TEST_VAULT_CONFIG = {
  path: process.env.TEST_VAULT_PATH || '',
  password: process.env.TEST_VAULT_PASSWORD || '',
  enableSigningTests: process.env.ENABLE_TX_SIGNING_TESTS === 'true',
  maxBalanceUsd: parseInt(process.env.MAX_TEST_VAULT_BALANCE_USD || '100', 10),
  seedphrase: process.env.TEST_SEEDPHRASE || '',
}

/**
 * Check if a test vault is configured
 */
export function isTestVaultConfigured(): boolean {
  return !!TEST_VAULT_CONFIG.path && existsSync(TEST_VAULT_CONFIG.path)
}

/**
 * Load test vault content from file
 *
 * @returns Vault file content as string, or null if not configured
 */
export function loadTestVaultContent(): string | null {
  if (!TEST_VAULT_CONFIG.path) {
    console.warn('⚠️  TEST_VAULT_PATH not set in environment')
    return null
  }

  if (!existsSync(TEST_VAULT_CONFIG.path)) {
    console.warn(`⚠️  Vault file not found: ${TEST_VAULT_CONFIG.path}`)
    return null
  }

  try {
    const content = readFileSync(TEST_VAULT_CONFIG.path, 'utf-8')
    console.log(`✅ Loaded vault from: ${TEST_VAULT_CONFIG.path}`)
    return content
  } catch (error) {
    console.error(`❌ Failed to read vault file: ${error}`)
    return null
  }
}

/**
 * Get test vault password
 */
export function getTestVaultPassword(): string {
  return TEST_VAULT_CONFIG.password
}

/**
 * Check if signing tests are enabled
 */
export function isSigningTestsEnabled(): boolean {
  return TEST_VAULT_CONFIG.enableSigningTests
}

/**
 * Skip test if vault is not configured
 * Use in test files: `skipIfNoVault()`
 */
export function skipIfNoVault(): void {
  if (!isTestVaultConfigured()) {
    console.log('⏭️  Skipping test: No test vault configured')
    console.log('   Set TEST_VAULT_PATH and TEST_VAULT_PASSWORD in .env')
  }
}
