// Run: yarn tsx --test clients/extension/tests/e2e/helpers/dapp-provider-readiness.test.ts
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { observeDappAccountRead } from './dapp-provider-readiness'

const pending = () => new Promise<string>(() => {})
const flush = async () => {
  for (let i = 0; i < 30; i++) await Promise.resolve()
}
const fixture = (): Parameters<typeof observeDappAccountRead<string>>[0] => ({
  sourceOrigin: 'http://127.0.0.1:3000',
  revision: 'test-revision',
  requestName: 'xrpl.getAddress',
  currentOrigin: () => 'http://127.0.0.1:3000',
  waitForInjection: async () => {},
  request: async () => 'rAccount',
  approveAndWaitForClose: async () => {},
  reload: async () => {},
  responseTimeoutMs: 10,
  approvalTimeoutMs: 10,
  injectionTimeoutMs: 10,
  recover: true,
})

test('grant closure can precede a delayed successful original response', async () => {
  const response = Promise.withResolvers<string>()
  const receiptPromise = observeDappAccountRead({
    ...fixture(),
    request: () => response.promise,
  })
  await flush()
  response.resolve('rAccount')
  const receipt = await receiptPromise
  assert.equal(receipt.requestAtPopupClosure.state, 'pending')
  assert.deepEqual(receipt.original, { state: 'resolved', value: 'rAccount' })
  assert.equal(receipt.verdict, 'PASS')
  assert.equal(receipt.recovery.attempted, false)
})

test('a rejected original remains rejected and never reloads', async () => {
  const receipt = await observeDappAccountRead({
    ...fixture(),
    request: async () => {
      throw new Error('4001: User rejected')
    },
    reload: async () => {
      assert.fail('must not retry rejection')
    },
  })
  assert.deepEqual(receipt.original, {
    state: 'rejected',
    error: '4001: User rejected',
  })
  assert.equal(receipt.verdict, 'FAIL')
  assert.equal(receipt.recovery.attempted, false)
})

test('successful recovery cannot mask an original timeout or late resolution', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const response = Promise.withResolvers<string>()
  let reads = 0
  let reloads = 0
  const run = observeDappAccountRead({
    ...fixture(),
    request: () =>
      ++reads === 1 ? response.promise : Promise.resolve('rRecovered'),
    reload: async () => {
      reloads++
      response.resolve('rLate')
    },
  })
  await flush()
  t.mock.timers.tick(10)
  const receipt = await run
  assert.deepEqual(receipt.original, { state: 'pending' })
  assert.deepEqual(receipt.recovery.result, {
    state: 'resolved',
    value: 'rRecovered',
  })
  assert.equal(receipt.verdict, 'FAIL')
  assert.equal(reads, 2)
  assert.equal(reloads, 1)
})

test('permanently pending calls have bounded recovery', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const run = observeDappAccountRead({ ...fixture(), request: pending })
  await flush()
  t.mock.timers.tick(10)
  await flush()
  t.mock.timers.tick(10)
  const receipt = await run
  assert.equal(receipt.original.state, 'pending')
  assert.equal(receipt.recovery.result.state, 'pending')
  assert.equal(receipt.verdict, 'FAIL')
})

test('recovery is opt-in', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const run = observeDappAccountRead({
    ...fixture(),
    request: pending,
    recover: false,
  })
  await flush()
  t.mock.timers.tick(10)
  assert.equal((await run).recovery.attempted, false)
})

test('a popup that never closes cannot pass even when the request resolves', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const run = observeDappAccountRead({
    ...fixture(),
    approveAndWaitForClose: () => new Promise(() => {}),
  })
  await flush()
  t.mock.timers.tick(10)
  const receipt = await run
  assert.equal(receipt.popupClosure.state, 'pending')
  assert.equal(receipt.original.state, 'resolved')
  assert.equal(receipt.verdict, 'FAIL')
  assert.equal(receipt.recovery.attempted, false)
})

test('a popup wait that finishes after its deadline cannot approve late', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const popup = Promise.withResolvers<void>()
  let approvals = 0
  const run = observeDappAccountRead({
    ...fixture(),
    approveAndWaitForClose: async signal => {
      await popup.promise
      signal.throwIfAborted()
      approvals++
    },
  })
  await flush()
  t.mock.timers.tick(10)
  const receipt = await run
  popup.resolve()
  await flush()
  assert.equal(approvals, 0)
  assert.equal(receipt.popupClosure.state, 'pending')
  assert.equal(receipt.verdict, 'FAIL')
})

test('aborting after an earlier check still prevents a later approval', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const beforeClick = Promise.withResolvers<void>()
  let approvals = 0
  const run = observeDappAccountRead({
    ...fixture(),
    approveAndWaitForClose: async signal => {
      signal.throwIfAborted()
      await beforeClick.promise
      signal.throwIfAborted()
      approvals++
    },
  })
  await flush()
  t.mock.timers.tick(10)
  const receipt = await run
  beforeClick.resolve()
  await flush()
  assert.equal(approvals, 0)
  assert.equal(receipt.popupClosure.state, 'pending')
  assert.equal(receipt.verdict, 'FAIL')
})

test('missing injection does not start a request or grant', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const run = observeDappAccountRead({
    ...fixture(),
    waitForInjection: () => new Promise(() => {}),
    request: async () => {
      assert.fail('must not request before injection')
    },
    approveAndWaitForClose: async () => {
      assert.fail('must not grant before injection')
    },
  })
  await flush()
  t.mock.timers.tick(10)
  const receipt = await run
  assert.equal(receipt.providerInjection.state, 'pending')
  assert.equal(receipt.verdict, 'FAIL')
})

for (const changeAt of ['before-reload', 'during-reload']) {
  test(`recovery refuses origin drift ${changeAt}`, async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] })
    let origin = fixture().sourceOrigin
    let reads = 0
    const run = observeDappAccountRead({
      ...fixture(),
      currentOrigin: () => origin,
      request: () => {
        reads++
        return pending()
      },
      reload: async () => {
        origin = 'http://other.test'
      },
    })
    await flush()
    if (changeAt === 'before-reload') origin = 'http://other.test'
    t.mock.timers.tick(10)
    const receipt = await run
    assert.equal(receipt.recovery.result.state, 'rejected')
    assert.equal(reads, 1)
    assert.equal(receipt.verdict, 'FAIL')
  })
}

test('pending reload is covered by the same recovery deadline', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const run = observeDappAccountRead({
    ...fixture(),
    request: pending,
    reload: () => new Promise(() => {}),
  })
  await flush()
  t.mock.timers.tick(10)
  await flush()
  t.mock.timers.tick(10)
  assert.equal((await run).recovery.result.state, 'pending')
})

test('a reload that completes after its deadline cannot issue a late recovery call', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const reload = Promise.withResolvers<void>()
  let reads = 0
  const run = observeDappAccountRead({
    ...fixture(),
    request: () => {
      reads++
      return pending()
    },
    reload: () => reload.promise,
  })
  await flush()
  t.mock.timers.tick(10)
  await flush()
  t.mock.timers.tick(10)
  const receipt = await run
  reload.resolve()
  await flush()
  assert.equal(reads, 1)
  assert.equal(receipt.recovery.result.state, 'pending')
})
