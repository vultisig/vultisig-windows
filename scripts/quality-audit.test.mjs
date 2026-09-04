import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'

import { runAudit } from './quality-audit.mjs'

const createWriter = () => {
  let value = ''
  return {
    stream: { write: chunk => (value += chunk) },
    value: () => value,
  }
}

const socketTimeout = "RequestError: Timeout awaiting 'socket' for 60000ms\n"
const silentWriter = { write: () => {} }
const runAuditForTest = options =>
  runAudit({ stdout: silentWriter, stderr: silentWriter, ...options })

test('does not honor --print when imported by another command', () => {
  const result = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '--eval',
      `await import(${JSON.stringify(new URL('./quality-audit.mjs', import.meta.url).href)})`,
      '--',
      '--print',
    ],
    { encoding: 'utf8' }
  )

  assert.equal(result.status, 0)
  assert.equal(result.stdout, '')
  assert.equal(result.stderr, '')
})

test('returns after a successful audit', async () => {
  let calls = 0
  await runAuditForTest({
    run: () => {
      calls += 1
      return { status: 0, stderr: '', stdout: 'audit passed\n' }
    },
  })

  assert.equal(calls, 1)
})

test('retries a registry socket timeout and then succeeds', async () => {
  let calls = 0
  const waits = []
  const stderr = createWriter()

  await runAuditForTest({
    run: () => {
      calls += 1
      return calls === 1
        ? { status: 1, stderr: socketTimeout, stdout: '' }
        : { status: 0, stderr: '', stdout: 'audit passed\n' }
    },
    stderr: stderr.stream,
    wait: milliseconds => waits.push(milliseconds),
  })

  assert.equal(calls, 2)
  assert.deepEqual(waits, [2_000])
  assert.match(stderr.value(), /retrying audit in 2 seconds \(attempt 2\/5\)/)
})

test('does not retry an audit finding', async () => {
  let calls = 0

  await assert.rejects(
    runAuditForTest({
      run: () => {
        calls += 1
        return { status: 1, stderr: 'high severity vulnerability found\n' }
      },
    }),
    /exited with code 1/
  )

  assert.equal(calls, 1)
})

test('uses the bounded backoff schedule before a final successful attempt', async () => {
  let calls = 0
  const waits = []

  await runAuditForTest({
    run: () => {
      calls += 1
      return calls < 5
        ? { status: 1, stderr: socketTimeout, stdout: '' }
        : { status: 0, stderr: '', stdout: 'audit passed\n' }
    },
    wait: milliseconds => waits.push(milliseconds),
  })

  assert.equal(calls, 5)
  assert.deepEqual(waits, [2_000, 15_000, 45_000, 90_000])
})

test('fails after all bounded attempts time out', async () => {
  let calls = 0

  await assert.rejects(
    runAuditForTest({
      run: () => {
        calls += 1
        return { status: 1, stderr: socketTimeout, stdout: '' }
      },
      wait: () => {},
    }),
    /exited with code 1/
  )

  assert.equal(calls, 5)
})
