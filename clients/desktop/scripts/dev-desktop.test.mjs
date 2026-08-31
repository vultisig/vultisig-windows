import { spawn } from 'node:child_process'
import { EventEmitter, once } from 'node:events'
import { createInterface } from 'node:readline'

import { describe, expect, it, vi } from 'vitest'

import {
  collectDescendantProcessIds,
  createProcessTreeTracker,
  runOwnedProcessTree,
  spawnOwnedProcessTree,
  terminateProcessTree,
  terminateProcessTreeSync,
} from './dev-desktop.mjs'

const pidExists = pid => {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    if (error?.code === 'ESRCH') return false
    throw error
  }
}

const waitFor = async (condition, timeoutMs = 5_000) => {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (condition()) return
    await new Promise(resolve => setTimeout(resolve, 25))
  }
  throw new Error('Timed out waiting for process state')
}

describe('desktop launcher process-tree lifecycle', () => {
  it('collects descendants across process-group boundaries by ancestry', () => {
    expect(
      collectDescendantProcessIds(10, [
        { parentPid: 10, pid: 11 },
        { parentPid: 11, pid: 12 },
        { parentPid: 99, pid: 13 },
        { parentPid: 12, pid: 14 },
      ])
    ).toEqual([11, 12, 14])
  })

  it('creates a dedicated POSIX process group without detaching on Windows', () => {
    const spawnImpl = vi.fn(() => ({ pid: 41 }))

    spawnOwnedProcessTree(
      'wails',
      ['dev'],
      { cwd: '/repo' },
      {
        platform: 'darwin',
        spawnImpl,
      }
    )
    expect(spawnImpl).toHaveBeenLastCalledWith(
      'wails',
      ['dev'],
      expect.objectContaining({ cwd: '/repo', detached: true })
    )

    spawnOwnedProcessTree(
      'wails',
      ['dev'],
      { cwd: 'C:\\repo' },
      {
        platform: 'win32',
        spawnImpl,
      }
    )
    expect(spawnImpl).toHaveBeenLastCalledWith(
      'wails',
      ['dev'],
      expect.objectContaining({ cwd: 'C:\\repo', detached: false })
    )
  })

  it('terminates identity-matched processes on POSIX and uses taskkill tree mode on Windows', () => {
    const killImpl = vi.fn()
    const posixSpawnSync = vi.fn(() => ({
      status: 0,
      stdout: '42 1 Mon Aug 31 10:00:00 2026\n',
    }))

    terminateProcessTreeSync({
      killImpl,
      pid: 42,
      platform: 'linux',
      spawnSyncImpl: posixSpawnSync,
    })
    expect(killImpl).toHaveBeenCalledWith(42, 'SIGKILL')

    const windowsSpawnSync = vi
      .fn()
      .mockReturnValueOnce({
        status: 0,
        stdout: '43 1 2026-08-31T10:00:00.0000000Z\n',
      })
      .mockReturnValue({ status: 0 })
    terminateProcessTreeSync({
      pid: 43,
      platform: 'win32',
      spawnSyncImpl: windowsSpawnSync,
    })
    expect(windowsSpawnSync).toHaveBeenCalledWith(
      'taskkill.exe',
      ['/PID', '43', '/T', '/F'],
      { stdio: 'ignore', windowsHide: true }
    )
  })

  it('uses one successful taskkill tree operation for Windows shutdown', async () => {
    const spawnSyncImpl = vi
      .fn()
      .mockReturnValueOnce({
        status: 0,
        stdout: '43 1 2026-08-31T10:00:00.0000000Z\n',
      })
      .mockReturnValue({ status: 0 })

    await terminateProcessTree({
      pid: 43,
      platform: 'win32',
      signal: 'SIGTERM',
      spawnSyncImpl,
    })

    expect(spawnSyncImpl).toHaveBeenCalledTimes(2)
    expect(spawnSyncImpl).toHaveBeenCalledWith(
      'taskkill.exe',
      ['/PID', '43', '/T'],
      { stdio: 'ignore', windowsHide: true }
    )
  })

  it('force-terminates a tracked Windows descendant after the root exits', async () => {
    const spawnSyncImpl = vi
      .fn()
      .mockReturnValueOnce({
        status: 0,
        stdout: '44 1 2026-08-31T10:00:01.0000000Z\n',
      })
      .mockReturnValue({ status: 0 })

    await terminateProcessTree({
      knownProcesses: [
        { identity: '2026-08-31T10:00:00.0000000Z', pid: 43 },
        { identity: '2026-08-31T10:00:01.0000000Z', pid: 44 },
      ],
      pid: 43,
      platform: 'win32',
      signal: 'SIGTERM',
      spawnSyncImpl,
    })

    expect(spawnSyncImpl).toHaveBeenCalledWith(
      'taskkill.exe',
      ['/PID', '44', '/T', '/F'],
      { stdio: 'ignore', windowsHide: true }
    )
  })

  it('forwards launcher shutdown and retains a synchronous exit fallback', async () => {
    const child = new EventEmitter()
    child.pid = 44
    const processRef = new EventEmitter()
    const terminateImpl = vi.fn(async () => undefined)
    const terminateSyncImpl = vi.fn()
    const tracker = {
      refresh: vi.fn(),
      snapshot: vi.fn(() => [{ identity: 'fixture-start', pid: 46 }]),
      stop: vi.fn(),
    }
    const run = runOwnedProcessTree({
      args: ['dev'],
      command: 'wails',
      options: {},
      platform: 'linux',
      processRef,
      spawnImpl: () => child,
      terminateImpl,
      terminateSyncImpl,
      trackerFactory: () => tracker,
    })

    processRef.emit('exit')
    expect(terminateSyncImpl).toHaveBeenCalledWith(
      expect.objectContaining({
        knownProcesses: [{ identity: 'fixture-start', pid: 46 }],
        pid: 44,
        signal: 'SIGKILL',
      })
    )

    processRef.emit('SIGTERM')
    child.emit('exit', null, 'SIGTERM')
    await expect(run).resolves.toBe(143)
    expect(terminateImpl).toHaveBeenCalledWith(
      expect.objectContaining({
        knownProcesses: [{ identity: 'fixture-start', pid: 46 }],
        pid: 44,
        signal: 'SIGTERM',
      })
    )
    expect(tracker.stop).toHaveBeenCalledOnce()
    expect(processRef.listenerCount('SIGTERM')).toBe(0)
    expect(processRef.listenerCount('exit')).toBe(0)
  })

  it('preserves a normal child exit code', async () => {
    const child = new EventEmitter()
    child.pid = 47
    const processRef = new EventEmitter()
    const terminateImpl = vi.fn(async () => undefined)
    const tracker = {
      refresh: vi.fn(),
      snapshot: vi.fn(() => [{ identity: 'fixture-start', pid: 47 }]),
      stop: vi.fn(),
    }
    const run = runOwnedProcessTree({
      args: ['dev'],
      command: 'wails',
      options: {},
      platform: 'linux',
      processRef,
      spawnImpl: () => child,
      terminateImpl,
      trackerFactory: () => tracker,
    })

    child.emit('exit', 0, null)

    await expect(run).resolves.toBe(0)
    expect(terminateImpl).toHaveBeenCalledWith(
      expect.objectContaining({ pid: 47, signal: 'SIGTERM' })
    )
  })

  it('does not signal a recycled PID with a different creation identity', () => {
    const killImpl = vi.fn()
    const spawnSyncImpl = vi.fn(() => ({
      status: 0,
      stdout: '48 1 Mon Aug 31 10:00:01 2026\n',
    }))

    terminateProcessTreeSync({
      knownProcesses: [{ identity: 'Mon Aug 31 10:00:00 2026', pid: 48 }],
      killImpl,
      pid: 48,
      platform: 'linux',
      spawnSyncImpl,
    })

    expect(killImpl).not.toHaveBeenCalled()
  })

  it('cleans up the process tree when the child fails to start', async () => {
    const child = new EventEmitter()
    child.pid = 45
    const processRef = new EventEmitter()
    const terminateImpl = vi.fn(async () => undefined)
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const run = runOwnedProcessTree({
      args: ['dev'],
      command: 'wails',
      options: {},
      platform: 'linux',
      processRef,
      spawnImpl: () => child,
      terminateImpl,
    })

    child.emit('error', new Error('fixture startup failure'))

    await expect(run).resolves.toBe(1)
    expect(terminateImpl).toHaveBeenCalledWith(
      expect.objectContaining({ pid: 45, signal: 'SIGTERM' })
    )
    expect(error).toHaveBeenCalledWith(
      'Unable to start Wails: fixture startup failure'
    )
    error.mockRestore()
  })

  it('removes the owned child and descendant while preserving an unrelated process', async () => {
    const ownedScript = `
        const { spawn } = require('node:child_process')
        const descendant = spawn(process.execPath, ['-e', 'process.on("SIGTERM", () => {}); setInterval(() => {}, 1000)'], {
          detached: true,
          stdio: 'ignore',
        })
        console.log(JSON.stringify({ descendant: descendant.pid, root: process.pid }))
        setInterval(() => {}, 1000)
      `
    const owned = spawnOwnedProcessTree(process.execPath, ['-e', ownedScript], {
      stdio: ['ignore', 'pipe', 'inherit'],
    })
    const control = spawn(
      process.execPath,
      ['-e', 'setInterval(() => {}, 1000)'],
      { detached: true, stdio: 'ignore' }
    )

    try {
      const lines = createInterface({ input: owned.stdout })
      const [line] = await once(lines, 'line')
      lines.close()
      const pids = JSON.parse(line)

      expect(pidExists(pids.root)).toBe(true)
      expect(pidExists(pids.descendant)).toBe(true)
      expect(pidExists(control.pid)).toBe(true)

      const ownedExit = once(owned, 'exit')
      await terminateProcessTree({
        graceMs: 250,
        pid: owned.pid,
        pollMs: 10,
        signal: 'SIGTERM',
      })
      await ownedExit
      await waitFor(() => !pidExists(pids.root) && !pidExists(pids.descendant))

      expect(pidExists(control.pid)).toBe(true)
    } finally {
      terminateProcessTreeSync({
        pid: owned.pid,
        signal: 'SIGKILL',
      })
      terminateProcessTreeSync({
        pid: control.pid,
        signal: 'SIGKILL',
      })
    }
  }, 10_000)

  it('cleans a tracked detached descendant after the immediate child fails', async () => {
    const childScript = `
      const { spawn } = require('node:child_process')
      const descendant = spawn(process.execPath, ['-e', 'process.on("SIGTERM", () => {}); setInterval(() => {}, 1000)'], {
        detached: true,
        stdio: 'ignore',
      })
      console.log(JSON.stringify({ descendant: descendant.pid, root: process.pid }))
      setTimeout(() => process.exit(7), 200)
    `
    const control = spawn(
      process.execPath,
      ['-e', 'setInterval(() => {}, 1000)'],
      { detached: true, stdio: 'ignore' }
    )
    let child
    let pids

    try {
      const run = runOwnedProcessTree({
        args: ['-e', childScript],
        command: process.execPath,
        options: { stdio: ['ignore', 'pipe', 'inherit'] },
        spawnImpl: (...spawnArgs) => {
          child = spawn(...spawnArgs)
          return child
        },
        terminateImpl: options =>
          terminateProcessTree({ ...options, graceMs: 100, pollMs: 10 }),
        trackerFactory: options =>
          createProcessTreeTracker({ ...options, intervalMs: 10 }),
      })
      const lines = createInterface({ input: child.stdout })
      const [line] = await once(lines, 'line')
      lines.close()
      pids = JSON.parse(line)

      await expect(run).resolves.toBe(7)
      await waitFor(() => !pidExists(pids.root) && !pidExists(pids.descendant))
      expect(pidExists(control.pid)).toBe(true)
    } finally {
      if (pids?.descendant) {
        terminateProcessTreeSync({ pid: pids.descendant, signal: 'SIGKILL' })
      }
      if (child?.pid) {
        terminateProcessTreeSync({ pid: child.pid, signal: 'SIGKILL' })
      }
      terminateProcessTreeSync({ pid: control.pid, signal: 'SIGKILL' })
    }
  }, 10_000)

  it('synchronously cleans a tracked cross-group descendant and preserves an unrelated process', async () => {
    const ownedScript = `
      const { spawn } = require('node:child_process')
      const descendant = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
        detached: true,
        stdio: 'ignore',
      })
      console.log(JSON.stringify({ descendant: descendant.pid, root: process.pid }))
      setInterval(() => {}, 1000)
    `
    const owned = spawnOwnedProcessTree(process.execPath, ['-e', ownedScript], {
      stdio: ['ignore', 'pipe', 'inherit'],
    })
    const control = spawn(
      process.execPath,
      ['-e', 'setInterval(() => {}, 1000)'],
      { detached: true, stdio: 'ignore' }
    )
    const tracker = createProcessTreeTracker({ intervalMs: 10, pid: owned.pid })
    let pids

    try {
      const lines = createInterface({ input: owned.stdout })
      const [line] = await once(lines, 'line')
      lines.close()
      pids = JSON.parse(line)
      await waitFor(() => {
        tracker.refresh()
        return tracker
          .snapshot()
          .some(process => process.pid === pids.descendant)
      })

      terminateProcessTreeSync({
        knownProcesses: tracker.snapshot(),
        pid: owned.pid,
        signal: 'SIGKILL',
      })
      await waitFor(() => !pidExists(pids.root) && !pidExists(pids.descendant))

      expect(pidExists(control.pid)).toBe(true)
    } finally {
      tracker.stop()
      if (pids?.descendant) {
        terminateProcessTreeSync({ pid: pids.descendant, signal: 'SIGKILL' })
      }
      terminateProcessTreeSync({ pid: owned.pid, signal: 'SIGKILL' })
      terminateProcessTreeSync({ pid: control.pid, signal: 'SIGKILL' })
    }
  }, 10_000)
})
