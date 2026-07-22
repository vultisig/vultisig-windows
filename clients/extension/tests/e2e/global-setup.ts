/**
 * Global Setup for Playwright E2E Tests
 *
 * Runs once before all tests:
 * 1. Verifies extension build exists
 * 2. Checks test vault configuration
 * 3. Writes environment info to available-chains.json for tests to consume
 */

import { FullConfig } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import {
  expectedExtensionArtifact,
  extensionArtifactDirectory,
  extensionPath,
} from './extension-path'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))

async function globalSetup(_config: FullConfig): Promise<void> {
  console.log('\n🚀 Global Setup: Preparing E2E test environment...\n')

  // 1. Verify extension build exists
  const manifestPath = path.join(extensionPath, 'manifest.json')
  const artifactReceiptPath = path.join(
    extensionPath,
    'extension-artifact.json'
  )

  if (!existsSync(manifestPath)) {
    console.error('❌ Extension not built!')
    console.error(`   Expected manifest at: ${manifestPath}`)
    console.error('   Run: yarn build:extension')
    throw new Error('Extension must be built before running E2E tests')
  }
  if (!existsSync(artifactReceiptPath)) {
    throw new Error(
      `Extension artifact receipt missing at ${artifactReceiptPath}. Rebuild the selected flavor before E2E QA.`
    )
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const artifactReceipt = JSON.parse(readFileSync(artifactReceiptPath, 'utf8'))

  if (
    artifactReceipt.schemaVersion !== 1 ||
    artifactReceipt.brand !== expectedExtensionArtifact.brand ||
    artifactReceipt.artifactDirectory !== extensionArtifactDirectory ||
    artifactReceipt.manifestName !== expectedExtensionArtifact.manifestName ||
    manifest.name !== expectedExtensionArtifact.manifestName
  ) {
    throw new Error(
      `Extension artifact brand mismatch at ${extensionPath}. Expected ${expectedExtensionArtifact.brand} / ${expectedExtensionArtifact.manifestName}, received ${artifactReceipt.brand} / ${manifest.name}.`
    )
  }
  console.log('✅ Extension build found at:', extensionPath)
  console.log('✅ Extension brand verified:', artifactReceipt.brand)

  // 2. Check test vault configuration
  const testVaultPath = process.env.TEST_VAULT_PATH
  if (testVaultPath && existsSync(testVaultPath)) {
    console.log('✅ Test vault configured')
  } else if (testVaultPath) {
    console.warn('⚠️  Test vault path set but file not found')
  } else {
    console.log('ℹ️  No test vault configured (some tests will be skipped)')
  }

  // 3. Check secure vault configuration
  const secureVaultShares = process.env.SECURE_VAULT_SHARES
  if (secureVaultShares) {
    const shares = secureVaultShares.split(',').map(s => s.trim())
    const allExist = shares.every(s => existsSync(s))
    if (allExist) {
      console.log('✅ Secure vault shares configured:', shares.length, 'shares')
    } else {
      console.warn('⚠️  Some secure vault shares not found')
    }
  }

  // 4. Create test-results directory if needed
  const testResultsDir = path.resolve(currentDirectory, 'test-results')
  if (!existsSync(testResultsDir)) {
    mkdirSync(testResultsDir, { recursive: true })
  }

  // 5. Write environment info for tests
  const envInfo = {
    timestamp: new Date().toISOString(),
    extensionPath,
    extensionBrand: artifactReceipt.brand,
    testVaultConfigured: !!testVaultPath && existsSync(testVaultPath),
    secureVaultConfigured: !!secureVaultShares,
    signingTestsEnabled: process.env.ENABLE_TX_SIGNING_TESTS === 'true',
    seedphraseConfigured: !!process.env.TEST_SEEDPHRASE,
  }

  writeFileSync(
    path.join(testResultsDir, 'env-info.json'),
    JSON.stringify(envInfo, null, 2)
  )
  console.log('✅ Environment info written to test-results/env-info.json')

  // 6. Initialize chain rotation state if needed (for fund-dependent tests)
  const chainRotationStatePath = path.resolve(
    currentDirectory,
    '.chain-rotation-state.json'
  )
  if (!existsSync(chainRotationStatePath)) {
    const initialState = {
      lastRun: null,
      chainTestHistory: {},
      selectedChains: [],
      selectedSwapPairs: [],
    }
    writeFileSync(chainRotationStatePath, JSON.stringify(initialState, null, 2))
    console.log('✅ Initialized chain rotation state')
  }

  console.log('\n✅ Global setup complete!\n')
}

export default globalSetup
