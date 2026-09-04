import { spawn, spawnSync } from 'node:child_process'
import { EventEmitter, once } from 'node:events'
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createInterface } from 'node:readline'

import { describe, expect, it, vi } from 'vitest'

import {
  collectDescendantProcessIds,
  createFrontendWatcherSupervisor,
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

  it('creates a long-lived Yarn watcher supervisor and removes its private directory', () => {
    const supervisor = createFrontendWatcherSupervisor({
      env: { PATH: '/fixture/bin' },
      platform: 'darwin',
      spawnSyncImpl: vi.fn(() => ({
        status: 0,
        stdout: '/fixture/bin/yarn\n',
      })),
    })

    expect(supervisor.envOverrides.PATH).toContain(
      path.dirname(supervisor.wrapperPath)
    )
    expect(supervisor.envOverrides.VULTISIG_REAL_YARN).toBe('/fixture/bin/yarn')
    expect(readFileSync(supervisor.wrapperPath, 'utf8')).toContain(
      'VULTISIG_DESKTOP_WATCHER_SUPERVISOR'
    )
    expect(
      readFileSync(
        supervisor.envOverrides.VULTISIG_DESKTOP_WATCHER_SUPERVISOR,
        'utf8'
      )
    ).toContain('VULTISIG_DESKTOP_WATCHER_PID_FILE')
    expect(existsSync(supervisor.wrapperPath)).toBe(true)

    supervisor.cleanup()
    expect(existsSync(supervisor.wrapperPath)).toBe(false)
  })

  it('preserves Windows Path casing and selects an invocable Yarn command', () => {
    const supervisor = createFrontendWatcherSupervisor({
      env: { Path: 'C:\\fixture\\bin' },
      platform: 'win32',
      spawnSyncImpl: vi.fn(() => ({
        status: 0,
        stdout: ['C:\\fixture\\bin\\yarn', 'C:\\fixture\\bin\\yarn.cmd'].join(
          '\r\n'
        ),
      })),
    })

    try {
      expect(supervisor.envOverrides.Path).toContain('C:\\fixture\\bin')
      expect(supervisor.envOverrides).not.toHaveProperty('PATH')
      expect(supervisor.envOverrides.VULTISIG_REAL_YARN).toBe(
        'C:\\fixture\\bin\\yarn.cmd'
      )
    } finally {
      supervisor.cleanup()
    }
  })

  it('terminates identity-matched processes on POSIX and uses taskkill tree mode on Windows', () => {
    const killImpl = vi.fn()
    const posixSpawnSync = vi.fn(() => ({
      status: 0,
      stdout: '42 1 42 Mon Aug 31 10:00:00 2026\n',
    }))

    terminateProcessTreeSync({
      killImpl,
      pid: 42,
      platform: 'linux',
      spawnSyncImpl: posixSpawnSync,
    })
    expect(killImpl).toHaveBeenCalledWith(42, 'SIGKILL')

    const windowsSpawnSync = vi.fn(command =>
      command === 'powershell.exe'
        ? {
            status: 0,
            stdout: '43 1 2026-08-31T10:00:00.0000000Z\n',
          }
        : { status: 0 }
    )
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
    const spawnSyncImpl = vi.fn(command =>
      command === 'powershell.exe'
        ? {
            status: 0,
            stdout: '44 1 2026-08-31T10:00:01.0000000Z\n',
          }
        : { status: 0 }
    )

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

  it('discovers a process registration at the shutdown grace boundary', async () => {
    const root = {
      identity: 'Mon Aug 31 10:00:00 2026',
      parentPid: 1,
      pgid: 43,
      pid: 43,
    }
    const watcher = {
      identity: 'Mon Aug 31 10:00:01 2026',
      parentPid: 1,
      pgid: 44,
      pid: 44,
      trustedPgid: true,
    }
    const liveProcesses = new Map([
      [root.pid, root],
      [watcher.pid, watcher],
    ])
    const processRows = () =>
      [...liveProcesses.values()]
        .map(
          process =>
            `${process.pid} ${process.parentPid} ${process.pgid} ${process.identity}`
        )
        .join('\n')
    const killImpl = vi.fn(pid => liveProcesses.delete(Math.abs(pid)))
    vi.useFakeTimers()
    vi.setSystemTime(0)
    const registrationAt = 40
    let refreshes = 0

    try {
      const termination = terminateProcessTree({
        graceMs: 45,
        knownProcesses: [root],
        killImpl,
        pid: root.pid,
        platform: 'linux',
        pollMs: 30,
        refreshKnownProcesses: () => {
          refreshes += 1
          return Date.now() >= registrationAt ? [root, watcher] : [root]
        },
        spawnSyncImpl: vi.fn(() => ({ status: 0, stdout: processRows() })),
      })

      await vi.advanceTimersByTimeAsync(60)
      await termination
      expect(refreshes).toBeGreaterThanOrEqual(2)
      expect(killImpl).not.toHaveBeenCalledWith(watcher.pid, 'SIGTERM')
      expect(killImpl).toHaveBeenCalledWith(watcher.pid, 'SIGKILL')
      expect(liveProcesses.has(watcher.pid)).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })

  it('checks tracked Windows survivors even after a successful root tree kill', async () => {
    const processLines = [
      '43 1 2026-08-31T10:00:00.0000000Z',
      '44 1 2026-08-31T10:00:01.0000000Z',
    ].join('\n')
    const spawnSyncImpl = vi.fn(command =>
      command === 'powershell.exe'
        ? { status: 0, stdout: processLines }
        : { status: 0 }
    )

    await terminateProcessTree({
      knownProcesses: [
        { identity: '2026-08-31T10:00:00.0000000Z', pid: 43 },
        { identity: '2026-08-31T10:00:01.0000000Z', pid: 44 },
      ],
      pid: 43,
      platform: 'win32',
      spawnSyncImpl,
    })

    expect(spawnSyncImpl).toHaveBeenCalledWith(
      'taskkill.exe',
      ['/PID', '44', '/T', '/F'],
      { stdio: 'ignore', windowsHide: true }
    )
  })

  it('does not force-kill a tracked Windows PID recycled after root shutdown', async () => {
    const originalProcesses = [
      '43 1 2026-08-31T10:00:00.0000000Z',
      '44 43 2026-08-31T10:00:01.0000000Z',
    ].join('\n')
    const recycledProcesses = '44 1 2026-08-31T10:00:02.0000000Z\n'
    let enumerations = 0
    const spawnSyncImpl = vi.fn(command => {
      if (command === 'powershell.exe') {
        enumerations += 1
        return {
          status: 0,
          stdout: enumerations === 1 ? originalProcesses : recycledProcesses,
        }
      }
      return { status: 0 }
    })

    await terminateProcessTree({
      knownProcesses: [
        { identity: '2026-08-31T10:00:00.0000000Z', pid: 43 },
        { identity: '2026-08-31T10:00:01.0000000Z', pid: 44 },
      ],
      pid: 43,
      platform: 'win32',
      spawnSyncImpl,
    })

    expect(spawnSyncImpl).not.toHaveBeenCalledWith(
      'taskkill.exe',
      ['/PID', '44', '/T', '/F'],
      expect.anything()
    )
  })

  it('forwards launcher shutdown and retains a synchronous exit fallback', async () => {
    const child = new EventEmitter()
    child.pid = 44
    const processRef = new EventEmitter()
    const terminateImpl = vi.fn(async () => undefined)
    const terminateSyncImpl = vi.fn()
    const cleanupSyncImpl = vi.fn()
    const tracker = {
      refresh: vi.fn(),
      snapshot: vi.fn(() => [{ identity: 'fixture-start', pid: 46 }]),
      stop: vi.fn(),
    }
    const run = runOwnedProcessTree({
      args: ['dev'],
      command: 'wails',
      cleanupSyncImpl,
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
    expect(cleanupSyncImpl).toHaveBeenCalledOnce()

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

  it('returns failure instead of hanging when signal-triggered cleanup fails', async () => {
    const child = new EventEmitter()
    child.pid = 50
    const processRef = new EventEmitter()
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const terminateSyncImpl = vi.fn()
    const run = runOwnedProcessTree({
      args: ['dev'],
      command: 'wails',
      options: {},
      platform: 'linux',
      processRef,
      spawnImpl: () => child,
      terminateSyncImpl,
      terminateImpl: vi.fn(async () => {
        throw new Error('fixture enumeration failure')
      }),
      trackerFactory: () => ({
        refresh: vi.fn(),
        snapshot: vi.fn(() => []),
        stop: vi.fn(),
      }),
    })

    processRef.emit('SIGTERM')

    await expect(run).resolves.toBe(1)
    expect(terminateSyncImpl).toHaveBeenCalledWith(
      expect.objectContaining({
        knownProcesses: [],
        pid: 50,
        signal: 'SIGKILL',
      })
    )
    expect(error).toHaveBeenCalledWith(
      'Unable to stop the Wails process tree: fixture enumeration failure'
    )
    error.mockRestore()
  })

  it('force-cleans a spawned tree if tracker construction throws', async () => {
    const child = new EventEmitter()
    child.pid = 50
    child.unref = vi.fn()
    const processRef = new EventEmitter()
    const terminateSyncImpl = vi.fn()
    const cleanupSyncImpl = vi.fn()
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const run = runOwnedProcessTree({
        args: ['dev'],
        command: 'wails',
        cleanupSyncImpl,
        options: {},
        platform: 'linux',
        processRef,
        spawnImpl: () => child,
        terminateSyncImpl,
        trackerFactory: () => {
          expect(child.listenerCount('error')).toBe(1)
          throw new Error('fixture tracker startup failure')
        },
      })
      // A failed spawn may still emit its asynchronous error after setup failed.
      expect(() =>
        child.emit('error', new Error('fixture spawn error'))
      ).not.toThrow()
      await expect(run).resolves.toBe(1)
      expect(terminateSyncImpl).toHaveBeenCalledWith(
        expect.objectContaining({
          pid: 50,
          platform: 'linux',
          signal: 'SIGKILL',
        })
      )
      expect(child.unref).toHaveBeenCalledOnce()
      expect(cleanupSyncImpl).toHaveBeenCalledOnce()
      expect(processRef.eventNames()).toEqual([])
    } finally {
      error.mockRestore()
    }
  })

  it('force-cleans remembered identities if synchronous tracker refresh throws', async () => {
    const child = new EventEmitter()
    child.pid = 50
    const processRef = new EventEmitter()
    const terminateSyncImpl = vi.fn()
    const terminateImpl = vi.fn()
    const stop = vi.fn()
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const run = runOwnedProcessTree({
        args: ['dev'],
        command: 'wails',
        options: {},
        platform: 'linux',
        processRef,
        spawnImpl: () => child,
        terminateImpl,
        terminateSyncImpl,
        trackerFactory: () => ({
          refresh: () => {
            throw new Error('fixture refresh failure')
          },
          snapshot: () => [{ identity: 'fixture-start', pid: 50 }],
          stop,
        }),
      })
      expect(() => processRef.emit('SIGTERM')).not.toThrow()
      await expect(run).resolves.toBe(1)
      expect(terminateImpl).not.toHaveBeenCalled()
      expect(terminateSyncImpl).toHaveBeenCalledWith(
        expect.objectContaining({
          knownProcesses: [{ identity: 'fixture-start', pid: 50 }],
          pid: 50,
          signal: 'SIGKILL',
        })
      )
      expect(stop).toHaveBeenCalledOnce()
      expect(processRef.eventNames()).toEqual([])
    } finally {
      error.mockRestore()
    }
  })

  it('unrefs a real child when both graceful and force cleanup fail', async () => {
    let child
    const processRef = new EventEmitter()
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const startedAt = Date.now()
    const run = runOwnedProcessTree({
      args: ['-e', 'setTimeout(() => {}, 1500)'],
      command: process.execPath,
      options: { stdio: 'ignore' },
      processRef,
      spawnImpl: (...spawnArgs) => {
        child = spawn(...spawnArgs)
        return child
      },
      terminateImpl: async () => {
        throw new Error('fixture graceful failure')
      },
      terminateSyncImpl: () => {
        throw new Error('fixture force failure')
      },
      trackerFactory: () => ({
        refresh: vi.fn(),
        snapshot: vi.fn(() => []),
        stop: vi.fn(),
      }),
    })

    try {
      processRef.emit('SIGTERM')
      await expect(run).resolves.toBe(1)
      expect(Date.now() - startedAt).toBeLessThan(500)
      expect(pidExists(child.pid)).toBe(true)
    } finally {
      process.kill(child.pid, 'SIGKILL')
      error.mockRestore()
    }
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
      stdout: [
        '48 1 48 Mon Aug 31 10:00:01 2026',
        '49 48 48 Mon Aug 31 10:00:02 2026',
      ].join('\n'),
    }))

    terminateProcessTreeSync({
      knownProcesses: [
        { identity: 'Mon Aug 31 10:00:00 2026', pgid: 48, pid: 48 },
      ],
      killImpl,
      pid: 48,
      platform: 'linux',
      spawnSyncImpl,
    })

    expect(killImpl).not.toHaveBeenCalled()
  })

  it('does not reacquire a recycled trusted process group', () => {
    const spawnSyncImpl = vi
      .fn()
      .mockReturnValueOnce({
        status: 0,
        stdout: '10 1 10 Mon Aug 31 10:00:00 2026\n',
      })
      .mockReturnValue({
        status: 0,
        stdout: [
          '10 1 10 Mon Aug 31 10:00:01 2026',
          '11 10 10 Mon Aug 31 10:00:02 2026',
        ].join('\n'),
      })
    const tracker = createProcessTreeTracker({
      intervalMs: 100_000,
      pid: 10,
      platform: 'linux',
      spawnSyncImpl,
    })

    try {
      tracker.refresh()
      expect(tracker.snapshot()).toEqual([
        expect.objectContaining({
          identity: 'Mon Aug 31 10:00:00 2026',
          pid: 10,
        }),
      ])
    } finally {
      tracker.stop()
    }
  })

  it('does not reacquire a recycled PID from a stale watcher registration', () => {
    const directory = mkdtempSync(
      path.join(tmpdir(), 'vultisig-registration-test-')
    )
    const pidFile = path.join(directory, 'watcher.pid')
    writeFileSync(
      pidFile,
      JSON.stringify({
        identity: 'Mon Aug 31 10:00:00 2026',
        pgid: 10,
        pid: 10,
      })
    )
    const spawnSyncImpl = vi
      .fn()
      .mockReturnValueOnce({
        status: 0,
        stdout: [
          '99 1 99 Mon Aug 31 09:59:59 2026',
          '10 1 10 Mon Aug 31 10:00:00 2026',
        ].join('\n'),
      })
      .mockReturnValue({
        status: 0,
        stdout: [
          '99 1 99 Mon Aug 31 09:59:59 2026',
          '10 1 10 Mon Aug 31 10:00:01 2026',
          '11 10 10 Mon Aug 31 10:00:02 2026',
        ].join('\n'),
      })
    const tracker = createProcessTreeTracker({
      intervalMs: 100_000,
      pid: 99,
      pidFiles: [pidFile],
      platform: 'linux',
      spawnSyncImpl,
    })

    try {
      tracker.refresh()
      const snapshot = tracker.snapshot()
      expect(snapshot).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            identity: 'Mon Aug 31 10:00:01 2026',
            pid: 10,
          }),
        ])
      )
      expect(snapshot).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ pid: 11 })])
      )
    } finally {
      tracker.stop()
      rmSync(directory, { force: true, recursive: true })
    }
  })

  it('rejects when Windows force cleanup fails and the identity-matched process remains', async () => {
    const processLine = '43 1 2026-08-31T10:00:00.0000000Z\n'
    const spawnSyncImpl = vi.fn(command =>
      command === 'powershell.exe'
        ? { status: 0, stdout: processLine }
        : { status: 5 }
    )

    await expect(
      terminateProcessTree({
        knownProcesses: [
          {
            identity: '2026-08-31T10:00:00.0000000Z',
            pgid: null,
            pid: 43,
          },
        ],
        pid: 43,
        platform: 'win32',
        spawnSyncImpl,
      })
    ).rejects.toThrow('Unable to terminate desktop process 43')
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

  it('cleans a registered detached descendant when the immediate child fails before the production poll interval', async () => {
    const fixtureDirectory = mkdtempSync(
      path.join(tmpdir(), 'vultisig-desktop-test-')
    )
    const pidFile = path.join(fixtureDirectory, 'watcher.pid')
    const childScript = `
      const { spawn, spawnSync } = require('node:child_process')
      const { writeFileSync } = require('node:fs')
      const descendant = spawn(process.execPath, ['-e', 'process.on("SIGTERM", () => {}); setInterval(() => {}, 1000)'], {
        detached: true,
        stdio: 'ignore',
      })
      const identity = spawnSync('ps', ['-o', 'lstart=', '-p', String(descendant.pid)], {
        encoding: 'utf8',
      }).stdout.trim()
      writeFileSync(${JSON.stringify(pidFile)}, JSON.stringify({
        identity,
        pgid: descendant.pid,
        pid: descendant.pid,
      }))
      console.log(JSON.stringify({ descendant: descendant.pid, root: process.pid }))
      setTimeout(() => process.exit(7), 10)
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
        ownedPidFiles: [pidFile],
        spawnImpl: (...spawnArgs) => {
          child = spawn(...spawnArgs)
          return child
        },
        terminateImpl: options =>
          terminateProcessTree({ ...options, graceMs: 100, pollMs: 10 }),
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
      rmSync(fixtureDirectory, { force: true, recursive: true })
    }
  }, 10_000)

  it('recovers the real Yarn process group when Wails kills its wrapper before the production poll interval', async () => {
    const fixtureDirectory = mkdtempSync(
      path.join(tmpdir(), 'vultisig-desktop-wrapper-test-')
    )
    const descendantFile = path.join(fixtureDirectory, 'descendant.json')
    const supervisor = createFrontendWatcherSupervisor({
      env: process.env,
      spawnSyncImpl: vi.fn(() => ({
        status: 0,
        stdout: `${process.execPath}\n`,
      })),
    })
    const yarnScript = `
      const { spawn } = require('node:child_process')
      const { writeFileSync } = require('node:fs')
      const descendant = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
        stdio: 'ignore',
      })
      writeFileSync(${JSON.stringify(descendantFile)}, JSON.stringify({
        descendant: descendant.pid,
        yarn: process.pid,
      }))
      setInterval(() => {}, 1000)
    `
    const rootScript = `
      const { spawn } = require('node:child_process')
      const { existsSync } = require('node:fs')
      const wrapper = spawn(${JSON.stringify(supervisor.wrapperPath)}, ['-e', ${JSON.stringify(yarnScript)}], {
        env: process.env,
        stdio: 'ignore',
      })
      const deadline = Date.now() + 5000
      const timer = setInterval(() => {
        if (!existsSync(${JSON.stringify(descendantFile)}) && Date.now() < deadline) return
        clearInterval(timer)
        try { process.kill(wrapper.pid, 'SIGKILL') } catch {}
        process.exit(7)
      }, 5)
    `
    let pids

    try {
      const run = runOwnedProcessTree({
        args: ['-e', rootScript],
        command: process.execPath,
        options: {
          env: { ...process.env, ...supervisor.envOverrides },
          stdio: 'ignore',
        },
        ownedPidFiles: [supervisor.pidFile],
        terminateImpl: options =>
          terminateProcessTree({ ...options, graceMs: 100, pollMs: 10 }),
      })

      await waitFor(() => existsSync(descendantFile))
      pids = JSON.parse(readFileSync(descendantFile, 'utf8'))
      await expect(run).resolves.toBe(7)
      await waitFor(
        () => !pidExists(pids.yarn) && !pidExists(pids.descendant)
      ).catch(() => {
        throw new Error(
          `Owned watcher processes remained: yarn=${pidExists(pids.yarn)}, descendant=${pidExists(pids.descendant)}, state=${String(
            spawnSync(
              'ps',
              [
                '-o',
                'pid=,ppid=,pgid=,state=,command=',
                '-p',
                String(pids.descendant),
              ],
              { encoding: 'utf8' }
            ).stdout
          ).trim()}`
        )
      })
    } finally {
      if (pids?.descendant) {
        terminateProcessTreeSync({ pid: pids.descendant, signal: 'SIGKILL' })
      }
      if (pids?.yarn) {
        terminateProcessTreeSync({ pid: pids.yarn, signal: 'SIGKILL' })
      }
      supervisor.cleanup()
      rmSync(fixtureDirectory, { force: true, recursive: true })
    }
  }, 10_000)

  it('cleans an invocation-group descendant when the root fails before the production poll interval', async () => {
    const supervisor = createFrontendWatcherSupervisor({
      env: process.env,
      spawnSyncImpl: vi.fn(() => ({
        status: 0,
        stdout: `${process.execPath}\n`,
      })),
    })
    const childScript = `
      const { spawn } = require('node:child_process')
      const descendant = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
        stdio: 'ignore',
      })
      console.log(JSON.stringify({ descendant: descendant.pid, root: process.pid }))
      setTimeout(() => process.exit(9), 10)
    `
    let child
    let pids

    try {
      const run = runOwnedProcessTree({
        args: [supervisor.wailsSupervisorPath, '-e', childScript],
        command: process.execPath,
        options: {
          env: {
            ...process.env,
            ...supervisor.envOverrides,
            VULTISIG_REAL_WAILS: process.execPath,
          },
          stdio: ['ignore', 'pipe', 'inherit'],
        },
        spawnImpl: (...spawnArgs) => {
          child = spawn(...spawnArgs)
          return child
        },
        terminateImpl: options =>
          terminateProcessTree({ ...options, graceMs: 100, pollMs: 10 }),
      })
      const lines = createInterface({ input: child.stdout })
      const [line] = await once(lines, 'line')
      lines.close()
      pids = JSON.parse(line)

      await expect(run).resolves.toBe(9)
      await waitFor(() => !pidExists(pids.root) && !pidExists(pids.descendant))
    } finally {
      if (pids?.descendant) {
        terminateProcessTreeSync({ pid: pids.descendant, signal: 'SIGKILL' })
      }
      if (child?.pid) {
        terminateProcessTreeSync({ pid: child.pid, signal: 'SIGKILL' })
      }
      supervisor.cleanup()
    }
  }, 10_000)

  it('surfaces process-enumeration failure instead of reporting successful cleanup', async () => {
    const spawnSyncImpl = vi.fn(() => ({ status: 1, stdout: '' }))

    await expect(
      terminateProcessTree({
        pid: 49,
        platform: 'linux',
        spawnSyncImpl,
      })
    ).rejects.toThrow('Unable to enumerate desktop processes')
    expect(() =>
      terminateProcessTreeSync({
        pid: 49,
        platform: 'linux',
        spawnSyncImpl,
      })
    ).toThrow('Unable to enumerate desktop processes')
  })

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
