/**
 * Global Teardown for Playwright E2E Tests
 *
 * Runs once after all tests complete:
 * 1. Reports fund status for fund-dependent tests
 * 2. Updates chain rotation state
 * 3. Generates summary report
 */

import { FullConfig } from '@playwright/test'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function globalTeardown(config: FullConfig): Promise<void> {
  console.log('\n🧹 Global Teardown: Cleaning up...\n')

  // 1. Update chain rotation state with run timestamp
  const chainRotationStatePath = path.resolve(__dirname, '..', '.chain-rotation-state.json')
  if (existsSync(chainRotationStatePath)) {
    try {
      const state = JSON.parse(readFileSync(chainRotationStatePath, 'utf-8'))
      state.lastRun = new Date().toISOString()
      writeFileSync(chainRotationStatePath, JSON.stringify(state, null, 2))
      console.log('✅ Updated chain rotation state')
    } catch (error) {
      console.warn('⚠️  Failed to update chain rotation state:', error)
    }
  }

  // 2. Check test results summary
  const testResultsPath = path.resolve(__dirname, 'test-results/results.json')
  if (existsSync(testResultsPath)) {
    try {
      const results = JSON.parse(readFileSync(testResultsPath, 'utf-8'))
      const { passed, failed, skipped, timedOut } = results.stats || {}
      console.log('\n📊 Test Results Summary:')
      console.log(`   ✅ Passed:  ${passed || 0}`)
      console.log(`   ❌ Failed:  ${failed || 0}`)
      console.log(`   ⏭️  Skipped: ${skipped || 0}`)
      console.log(`   ⏱️  Timeout: ${timedOut || 0}`)
    } catch {
      // Results file may not exist or be incomplete
    }
  }

  // 3. Clean up any temporary files
  // (Currently no temp files to clean, but placeholder for future)

  console.log('\n✅ Global teardown complete!\n')
}

export default globalTeardown
