import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const repoRoot = path.resolve(__dirname, '../../../..')

const readRepoFile = (relativePath: string) =>
  fs.readFileSync(path.resolve(repoRoot, relativePath), 'utf-8')

/**
 * The E2E suite is unrunnable unless the runner is configured exactly right, and
 * the symptom is a link error deep in node_modules rather than anything that
 * points at the cause. These assertions pin the two settings that broke it.
 */
describe('e2e runner configuration', () => {
  const nvmrc = readRepoFile('.nvmrc').trim()
  const ciWorkflow = readRepoFile('clients/extension/tests/e2e/ci-workflow.yml')

  it('pins an exact Node major rather than a floating alias', () => {
    expect(nvmrc).toMatch(/^\d+$/)
  })

  it('runs CI on the Node major the repo pins', () => {
    const nodeVersion = ciWorkflow.match(/NODE_VERSION:\s*'([^']+)'/)?.[1]

    expect(nodeVersion).toBe(nvmrc)
  })

  it('forces Playwright onto the async loader in the e2e script', () => {
    const { scripts } = JSON.parse(
      readRepoFile('clients/extension/package.json')
    )

    expect(scripts['test:e2e']).toContain('PLAYWRIGHT_FORCE_ASYNC_LOADER=1')
  })

  it('forces Playwright onto the async loader in CI', () => {
    expect(ciWorkflow).toMatch(/PLAYWRIGHT_FORCE_ASYNC_LOADER:\s*'1'/)
  })
})
