import { spawn, spawnSync } from 'node:child_process'
import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  assertDesktopRuntimePortsAvailable,
  resolveDesktopRepositoryRoot,
  resolveDesktopRuntime,
} from './worktreeRuntime.mjs'

const shutdownSignals = ['SIGINT', 'SIGTERM']
const signalExitCodes = { SIGINT: 130, SIGTERM: 143 }

const ignoreMissingProcess = error => {
  if (error?.code !== 'ESRCH') throw error
}

const delay = milliseconds =>
  new Promise(resolve => setTimeout(resolve, milliseconds))

const processTable = (platform, spawnSyncImpl) => {
  const result =
    platform === 'win32'
      ? spawnSyncImpl(
          'powershell.exe',
          [
            '-NoProfile',
            '-NonInteractive',
            '-Command',
            'Get-CimInstance Win32_Process | ForEach-Object { "$($_.ProcessId) $($_.ParentProcessId) $($_.CreationDate.ToUniversalTime().ToString(\'o\'))" }',
          ],
          { encoding: 'utf8', windowsHide: true }
        )
      : spawnSyncImpl('ps', ['-axo', 'pid=,ppid=,pgid=,lstart='], {
          encoding: 'utf8',
        })
  if (result.error || result.status !== 0) {
    throw new Error(
      `Unable to enumerate desktop processes: ${
        result.error?.message ?? `exit ${result.status}`
      }`
    )
  }

  return String(result.stdout ?? '')
    .trim()
    .split(/\r?\n/)
    .map(line =>
      line
        .trim()
        .match(
          platform === 'win32'
            ? /^(\d+)\s+(\d+)\s+(.+)$/
            : /^(\d+)\s+(\d+)\s+(\d+)\s+(.+)$/
        )
    )
    .filter(Boolean)
    .map(match =>
      platform === 'win32'
        ? {
            identity: match[3],
            parentPid: Number(match[2]),
            pgid: null,
            pid: Number(match[1]),
          }
        : {
            identity: match[4],
            parentPid: Number(match[2]),
            pgid: Number(match[3]),
            pid: Number(match[1]),
          }
    )
    .filter(
      ({ identity, parentPid, pid }) =>
        identity.length > 0 &&
        Number.isInteger(pid) &&
        pid > 0 &&
        Number.isInteger(parentPid) &&
        parentPid >= 0
    )
}

export const collectDescendantProcessIds = (rootPid, processes) => {
  const owned = new Set([rootPid])
  let changed = true
  while (changed) {
    changed = false
    for (const { parentPid, pid } of processes) {
      if (!owned.has(parentPid) || owned.has(pid)) continue
      owned.add(pid)
      changed = true
    }
  }
  owned.delete(rootPid)
  return [...owned]
}

export const createProcessTreeTracker = ({
  intervalMs,
  pid,
  pidFiles = [],
  platform = process.platform,
  spawnSyncImpl = spawnSync,
}) => {
  const ownedProcesses = new Map()
  const remember = (process, { trustedGroup = false } = {}) => {
    const remembered = {
      ...process,
      ...(trustedGroup || ownedProcesses.get(process.pid)?.trustedPgid
        ? { trustedPgid: true }
        : {}),
    }
    ownedProcesses.set(process.pid, remembered)
  }
  const refresh = () => {
    let processes
    try {
      processes = processTable(platform, spawnSyncImpl)
    } catch {
      return false
    }
    const liveByPid = new Map(processes.map(process => [process.pid, process]))
    const activeTrustedGroups = new Set()
    const root = liveByPid.get(pid)
    if (root && !ownedProcesses.has(pid)) {
      remember(root, { trustedGroup: platform !== 'win32' })
    }
    if (platform !== 'win32') {
      for (const owned of ownedProcesses.values()) {
        const live = liveByPid.get(owned.pid)
        if (owned.trustedPgid === true && live?.identity === owned.identity) {
          activeTrustedGroups.add(live.pgid)
        }
      }
    }
    for (const pidFile of pidFiles) {
      try {
        const value = readFileSync(pidFile, 'utf8').trim()
        const registration = value.startsWith('{')
          ? JSON.parse(value)
          : { pid: Number(value) }
        const registered = liveByPid.get(Number(registration.pid))
        if (registered && registration.identity === registered.identity) {
          remember(registered, { trustedGroup: platform !== 'win32' })
          if (platform !== 'win32') {
            activeTrustedGroups.add(registered.pgid)
          }
        }
      } catch (error) {
        if (error?.code !== 'ENOENT' && !(error instanceof SyntaxError)) {
          throw error
        }
      }
    }
    if (platform !== 'win32') {
      for (const process of processes) {
        if (activeTrustedGroups.has(process.pgid)) {
          remember(process, { trustedGroup: true })
        }
      }
    }
    let changed = true
    while (changed) {
      changed = false
      for (const process of processes) {
        const parentIdentity = ownedProcesses.get(process.parentPid)?.identity
        const parent = liveByPid.get(process.parentPid)
        if (
          !parentIdentity ||
          parent?.identity !== parentIdentity ||
          ownedProcesses.has(process.pid)
        ) {
          continue
        }
        remember(process)
        changed = true
      }
    }
    return true
  }
  refresh()
  const timer = setInterval(
    refresh,
    intervalMs ?? (platform === 'win32' ? 2_000 : 250)
  )
  timer.unref()

  return {
    refresh,
    snapshot: () => [...ownedProcesses.values()],
    stop: () => clearInterval(timer),
  }
}

const outputLines = result =>
  String(result.stdout ?? '')
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)

export const createFrontendWatcherSupervisor = ({
  env,
  platform = process.platform,
  spawnSyncImpl = spawnSync,
}) => {
  const command = platform === 'win32' ? 'where.exe' : 'which'
  const result = spawnSyncImpl(command, ['yarn'], {
    encoding: 'utf8',
    env,
    windowsHide: true,
  })
  const candidates = outputLines(result)
  const realYarn =
    platform === 'win32'
      ? candidates.find(candidate => /\.(cmd|exe)$/i.test(candidate))
      : candidates[0]
  if (result.error || result.status !== 0 || !realYarn) {
    throw new Error(
      `Unable to resolve Yarn for desktop watcher supervision: ${
        result.error?.message ?? `exit ${result.status}`
      }`
    )
  }

  const directory = mkdtempSync(path.join(tmpdir(), 'vultisig-desktop-'))
  const pidFile = path.join(directory, 'watcher.pid')
  const scriptPath = path.join(directory, 'watcher-launcher.cjs')
  const supervisorPath = path.join(directory, 'watcher-supervisor.cjs')
  const wailsSupervisorPath = path.join(directory, 'wails-supervisor.cjs')
  let wrapperPath
  const sourcePathKey =
    Object.keys(env).find(key => key.toLowerCase() === 'path') ?? 'PATH'
  const pathDelimiter = platform === 'win32' ? ';' : path.delimiter
  const envOverrides = {
    [sourcePathKey]: `${directory}${pathDelimiter}${env[sourcePathKey] ?? ''}`,
    VULTISIG_DESKTOP_WATCHER_PID_FILE: pidFile,
    VULTISIG_DESKTOP_WATCHER_SCRIPT: scriptPath,
    VULTISIG_DESKTOP_WATCHER_SUPERVISOR: supervisorPath,
    VULTISIG_NODE: process.execPath,
    VULTISIG_REAL_YARN: realYarn,
    VULTISIG_REAL_WAILS: 'wails',
  }

  writeFileSync(
    supervisorPath,
    [
      "const { spawn, spawnSync } = require('node:child_process')",
      "const { renameSync, writeFileSync } = require('node:fs')",
      "if (process.platform !== 'win32') process.on('SIGHUP', () => {})",
      "const identityResult = process.platform === 'win32'",
      "  ? spawnSync('powershell.exe', [",
      "      '-NoProfile', '-NonInteractive',",
      "      '-Command', `(Get-CimInstance Win32_Process -Filter \"ProcessId = ${process.pid}\").CreationDate.ToUniversalTime().ToString('o')`,",
      "    ], { encoding: 'utf8', windowsHide: true })",
      "  : spawnSync('ps', ['-o', 'lstart=', '-p', String(process.pid)], { encoding: 'utf8' })",
      "if (identityResult.error || identityResult.status !== 0) throw new Error('Unable to identify Yarn watcher supervisor')",
      "const identity = String(identityResult.stdout || '').trim()",
      "if (!identity) throw new Error('Yarn watcher supervisor identity is empty')",
      'const pidFile = process.env.VULTISIG_DESKTOP_WATCHER_PID_FILE',
      'const pendingPidFile = `${pidFile}.${process.pid}.tmp`',
      'writeFileSync(',
      '  pendingPidFile,',
      "  JSON.stringify({ identity, pid: process.pid, pgid: process.platform === 'win32' ? null : process.pid })",
      ')',
      'renameSync(pendingPidFile, pidFile)',
      'const child = spawn(process.env.VULTISIG_REAL_YARN, process.argv.slice(2), {',
      "  env: process.env, shell: process.platform === 'win32', stdio: 'inherit',",
      '})',
      'let requestedSignal = null',
      "for (const signal of ['SIGINT', 'SIGTERM']) {",
      '  process.on(signal, () => {',
      '    requestedSignal ??= signal',
      '    try { child.kill(signal) } catch (error) {',
      "      if (error?.code !== 'ESRCH') throw error",
      '    }',
      '  })',
      '}',
      "child.on('error', error => {",
      '  console.error(`Unable to start Yarn watcher: ${error.message}`)',
      '  process.exitCode = 1',
      '})',
      "child.on('exit', (code, signal) => {",
      '  const finish = () => {',
      "    process.exitCode = signal === 'SIGINT' ? 130 : signal === 'SIGTERM' ? 143 : (code ?? 1)",
      '  }',
      '  setTimeout(finish, 2500)',
      '})',
      '',
    ].join('\n')
  )

  writeFileSync(
    scriptPath,
    [
      "const { spawn } = require('node:child_process')",
      'const child = spawn(',
      '  process.env.VULTISIG_NODE,',
      '  [process.env.VULTISIG_DESKTOP_WATCHER_SUPERVISOR, ...process.argv.slice(2)],',
      "  { detached: true, env: process.env, stdio: 'inherit' }",
      ')',
      "for (const signal of ['SIGINT', 'SIGTERM']) {",
      '  process.on(signal, () => {',
      '    try { child.kill(signal) } catch (error) {',
      "      if (error?.code !== 'ESRCH') throw error",
      '    }',
      '  })',
      '}',
      "child.on('error', error => {",
      '  console.error(`Unable to start Yarn watcher supervisor: ${error.message}`)',
      '  process.exitCode = 1',
      '})',
      "child.on('exit', (code, signal) => {",
      "  process.exitCode = signal === 'SIGINT' ? 130 : signal === 'SIGTERM' ? 143 : (code ?? 1)",
      '})',
      '',
    ].join('\n')
  )

  writeFileSync(
    wailsSupervisorPath,
    [
      "const { spawn } = require('node:child_process')",
      "if (process.platform !== 'win32') process.on('SIGHUP', () => {})",
      'const child = spawn(process.env.VULTISIG_REAL_WAILS, process.argv.slice(2), {',
      "  env: process.env, shell: process.platform === 'win32', stdio: 'inherit',",
      '})',
      'let requestedSignal = null',
      "for (const signal of ['SIGINT', 'SIGTERM']) {",
      '  process.on(signal, () => {',
      '    requestedSignal ??= signal',
      '    try { child.kill(signal) } catch (error) {',
      "      if (error?.code !== 'ESRCH') throw error",
      '    }',
      '  })',
      '}',
      "child.on('error', error => {",
      '  console.error(`Unable to start Wails: ${error.message}`)',
      '  process.exitCode = 1',
      '})',
      "child.on('exit', (code, signal) => {",
      '  const finish = () => {',
      "    process.exitCode = signal === 'SIGINT' ? 130 : signal === 'SIGTERM' ? 143 : (code ?? 1)",
      '  }',
      '  setTimeout(finish, 2500)',
      '})',
      '',
    ].join('\n')
  )

  if (platform === 'win32') {
    wrapperPath = path.join(directory, 'yarn.cmd')
    writeFileSync(
      wrapperPath,
      [
        '@echo off',
        '"%VULTISIG_NODE%" "%VULTISIG_DESKTOP_WATCHER_SCRIPT%" %*',
        'exit /b %ERRORLEVEL%',
        '',
      ].join('\r\n')
    )
  } else {
    wrapperPath = path.join(directory, 'yarn')
    writeFileSync(
      wrapperPath,
      [`#!${process.execPath}`, readFileSync(scriptPath, 'utf8'), ''].join('\n')
    )
    chmodSync(wrapperPath, 0o755)
  }

  return {
    cleanup: () => rmSync(directory, { force: true, recursive: true }),
    envOverrides,
    pidFile,
    wailsSupervisorPath,
    wrapperPath,
  }
}

const captureOwnedProcesses = ({
  knownProcesses,
  pid,
  platform,
  spawnSyncImpl,
}) => {
  const processes = processTable(platform, spawnSyncImpl)
  const liveByPid = new Map(processes.map(process => [process.pid, process]))
  const owned = new Map()
  const ownedProcessGroups = new Set()

  for (const process of knownProcesses) {
    if (liveByPid.get(process.pid)?.identity === process.identity) {
      const live = {
        ...liveByPid.get(process.pid),
        ...(process.trustedPgid === true ? { trustedPgid: true } : {}),
      }
      owned.set(process.pid, live)
      if (platform !== 'win32' && Number.isInteger(live.pgid)) {
        ownedProcessGroups.add(live.pgid)
      }
    }
  }
  if (!knownProcesses.length) {
    const root = liveByPid.get(pid)
    if (root) {
      owned.set(root.pid, root)
      if (Number.isInteger(root.pgid)) ownedProcessGroups.add(root.pgid)
    }
  }
  if (platform !== 'win32') {
    for (const process of processes) {
      if (ownedProcessGroups.has(process.pgid)) {
        owned.set(process.pid, { ...process, trustedPgid: true })
      }
    }
  }

  let changed = true
  while (changed) {
    changed = false
    for (const process of processes) {
      const parentIdentity = owned.get(process.parentPid)?.identity
      if (
        !parentIdentity ||
        liveByPid.get(process.parentPid)?.identity !== parentIdentity ||
        owned.has(process.pid)
      ) {
        continue
      }
      owned.set(process.pid, process)
      changed = true
    }
  }

  return { liveByPid, owned }
}

const matchingProcesses = (owned, liveByPid) =>
  [...owned.values()].filter(
    process => liveByPid.get(process.pid)?.identity === process.identity
  )

const taskkill = ({ force, pid, spawnSyncImpl }) =>
  spawnSyncImpl(
    'taskkill.exe',
    ['/PID', String(pid), '/T', ...(force ? ['/F'] : [])],
    { stdio: 'ignore', windowsHide: true }
  )

const forceTaskkill = ({ process, spawnSyncImpl }) => {
  const current = processTable('win32', spawnSyncImpl).find(
    candidate => candidate.pid === process.pid
  )
  if (current?.identity !== process.identity) return
  const result = taskkill({ force: true, pid: process.pid, spawnSyncImpl })
  if (!result?.error && result?.status === 0) return
  const live = processTable('win32', spawnSyncImpl).find(
    candidate => candidate.pid === process.pid
  )
  if (live?.identity === process.identity) {
    throw new Error(`Unable to terminate desktop process ${process.pid}`)
  }
}

export const terminateProcessTreeSync = ({
  knownProcesses = [],
  killImpl = process.kill,
  pid,
  platform = process.platform,
  signal = 'SIGKILL',
  spawnSyncImpl = spawnSync,
}) => {
  if (!Number.isInteger(pid) || pid <= 0) return

  const { liveByPid, owned } = captureOwnedProcesses({
    knownProcesses,
    pid,
    platform,
    spawnSyncImpl,
  })
  const matches = matchingProcesses(owned, liveByPid)

  if (platform === 'win32') {
    const root = matches.find(process => process.pid === pid)
    if (root) forceTaskkill({ process: root, spawnSyncImpl })
    for (const process of matches.reverse()) {
      if (process.pid !== pid) {
        forceTaskkill({ process, spawnSyncImpl })
      }
    }
    return
  }

  for (const process of matches.reverse()) {
    try {
      killImpl(process.pid, signal)
    } catch (error) {
      ignoreMissingProcess(error)
    }
  }
}

export const terminateProcessTree = async ({
  graceMs = 1_500,
  knownProcesses = [],
  killImpl = process.kill,
  pid,
  platform = process.platform,
  pollMs = 25,
  refreshKnownProcesses,
  signal = 'SIGTERM',
  spawnSyncImpl = spawnSync,
}) => {
  if (!Number.isInteger(pid) || pid <= 0) return

  if (platform === 'win32') {
    const stopKnownProcesses = (processes, { forceRoot = false } = {}) => {
      const { liveByPid, owned } = captureOwnedProcesses({
        knownProcesses: processes,
        pid,
        platform,
        spawnSyncImpl,
      })
      const matches = matchingProcesses(owned, liveByPid)
      const root = matches.find(process => process.pid === pid)
      if (root) {
        if (forceRoot) {
          forceTaskkill({ process: root, spawnSyncImpl })
        } else {
          const result = taskkill({ force: false, pid, spawnSyncImpl })
          if (result?.error || result?.status !== 0) {
            forceTaskkill({ process: root, spawnSyncImpl })
          }
        }
      }
      for (const process of matches.reverse()) {
        if (process.pid !== pid) {
          forceTaskkill({ process, spawnSyncImpl })
        }
      }
    }

    stopKnownProcesses(knownProcesses)
    if (refreshKnownProcesses) {
      const deadline = Date.now() + graceMs
      while (Date.now() < deadline) {
        await delay(pollMs)
        stopKnownProcesses(refreshKnownProcesses(), { forceRoot: true })
      }
    }
    return
  }

  const owned = new Map(knownProcesses.map(process => [process.pid, process]))
  const signalOwnedProcesses = ownedSignal => {
    for (const process of refreshKnownProcesses?.() ?? []) {
      owned.set(process.pid, process)
    }
    const captured = captureOwnedProcesses({
      knownProcesses: [...owned.values()],
      pid,
      platform,
      spawnSyncImpl,
    })
    for (const process of captured.owned.values()) {
      owned.set(process.pid, process)
    }
    for (const process of matchingProcesses(
      captured.owned,
      captured.liveByPid
    ).reverse()) {
      try {
        killImpl(process.pid, ownedSignal)
      } catch (error) {
        if (error?.code !== 'ESRCH') throw error
      }
    }
    return matchingProcesses(captured.owned, captured.liveByPid).length > 0
  }

  signalOwnedProcesses(signal)

  const deadline = Date.now() + graceMs
  while (Date.now() < deadline) {
    if (!signalOwnedProcesses(signal) && !refreshKnownProcesses) return
    await delay(pollMs)
  }

  for (const process of refreshKnownProcesses?.() ?? []) {
    owned.set(process.pid, process)
  }

  terminateProcessTreeSync({
    knownProcesses: [...owned.values()],
    killImpl,
    pid,
    platform,
    signal: 'SIGKILL',
    spawnSyncImpl,
  })
}

export const spawnOwnedProcessTree = (
  command,
  args,
  options,
  { platform = process.platform, spawnImpl = spawn } = {}
) =>
  spawnImpl(command, args, {
    ...options,
    detached: platform !== 'win32',
  })

export const runOwnedProcessTree = async ({
  args,
  cleanupSyncImpl = () => {},
  command,
  options,
  ownedPidFiles = [],
  platform = process.platform,
  processRef = process,
  spawnImpl = spawn,
  spawnSyncImpl = spawnSync,
  trackerFactory = createProcessTreeTracker,
  terminateImpl = terminateProcessTree,
  terminateSyncImpl = terminateProcessTreeSync,
}) => {
  let child
  try {
    child = spawnOwnedProcessTree(command, args, options, {
      platform,
      spawnImpl,
    })
  } catch (error) {
    console.error(`Unable to start Wails: ${error.message}`)
    return 1
  }

  const tracker = trackerFactory({
    pid: child.pid,
    pidFiles: ownedPidFiles,
    platform,
    spawnSyncImpl,
  })

  let requestedSignal = null
  let terminationPromise = null
  let terminationError = null
  let settleChildResult
  const childResult = new Promise(resolve => {
    settleChildResult = resolve
    child.once('error', error => resolve({ error }))
    child.once('exit', (code, signal) => resolve({ code, signal }))
  })
  const startTermination = signal => {
    tracker.refresh()
    terminationPromise ??= Promise.resolve(
      terminateImpl({
        knownProcesses: tracker.snapshot(),
        pid: child.pid,
        platform,
        refreshKnownProcesses: () => {
          tracker.refresh()
          return tracker.snapshot()
        },
        signal,
        spawnSyncImpl,
      })
    ).catch(error => {
      terminationError = error
      console.error(`Unable to stop the Wails process tree: ${error.message}`)
      try {
        tracker.refresh()
        terminateSyncImpl({
          knownProcesses: tracker.snapshot(),
          pid: child.pid,
          platform,
          signal: 'SIGKILL',
          spawnSyncImpl,
        })
      } catch (fallbackError) {
        console.error(
          `Unable to force-stop the Wails process tree: ${fallbackError.message}`
        )
      }
      child.unref?.()
      child.stdin?.unref?.()
      child.stdout?.unref?.()
      child.stderr?.unref?.()
      settleChildResult({ cleanupError: error })
    })
  }
  const signalHandlers = Object.fromEntries(
    shutdownSignals.map(signal => [
      signal,
      () => {
        requestedSignal ??= signal
        startTermination(signal)
      },
    ])
  )
  for (const [signal, handler] of Object.entries(signalHandlers)) {
    processRef.on(signal, handler)
  }

  const exitFallback = () => {
    try {
      tracker.refresh()
      terminateSyncImpl({
        knownProcesses: tracker.snapshot(),
        pid: child.pid,
        platform,
        signal: 'SIGKILL',
        spawnSyncImpl,
      })
    } finally {
      cleanupSyncImpl()
    }
  }
  processRef.on('exit', exitFallback)

  const result = await childResult

  startTermination(requestedSignal ?? 'SIGTERM')
  await terminationPromise
  tracker.stop()

  for (const [signal, handler] of Object.entries(signalHandlers)) {
    processRef.off(signal, handler)
  }
  processRef.off('exit', exitFallback)

  if (result.error) {
    console.error(`Unable to start Wails: ${result.error.message}`)
    return 1
  }
  if (terminationError || result.cleanupError) return 1
  if (requestedSignal) return signalExitCodes[requestedSignal]
  if (result.signal) return signalExitCodes[result.signal] ?? 1
  return result.code ?? 1
}

export const runDesktopLauncher = async ({
  argv = process.argv.slice(2),
  env: sourceEnv = process.env,
} = {}) => {
  const cwd = resolveDesktopRepositoryRoot(import.meta.url)
  const forwardedArgs = [...argv]
  const fullIndex = forwardedArgs.indexOf('--full')
  const full = fullIndex >= 0
  if (full) forwardedArgs.splice(fullIndex, 1)

  const runtime = resolveDesktopRuntime({ cwd, env: sourceEnv })
  await assertDesktopRuntimePortsAvailable(runtime)
  const wailsArgs = [
    'dev',
    ...(full ? [] : ['-s', '-skipbindings', '-m', '-nosyncgomod']),
    '-devserver',
    `127.0.0.1:${runtime.wailsPort}`,
    ...forwardedArgs,
  ]
  const env = {
    ...sourceEnv,
    APP_PORT: String(runtime.appPort),
    WAILS_DEV_PORT: String(runtime.wailsPort),
    VULTISIG_MEDIATOR_PORT: String(runtime.mediatorPort),
    ...(runtime.dbPath ? { VULTISIG_DB_PATH: runtime.dbPath } : {}),
  }

  console.log(
    `Desktop development runtime: Vite http://127.0.0.1:${runtime.appPort}/, ` +
      `Wails http://127.0.0.1:${runtime.wailsPort}/, ` +
      `mediator http://127.0.0.1:${runtime.mediatorPort}/` +
      (runtime.dbPath ? `, database ${runtime.dbPath}` : '')
  )
  const watcherSupervisor = createFrontendWatcherSupervisor({
    env,
  })

  try {
    return await runOwnedProcessTree({
      args: [watcherSupervisor.wailsSupervisorPath, ...wailsArgs],
      cleanupSyncImpl: watcherSupervisor.cleanup,
      command: process.execPath,
      options: {
        cwd,
        env: { ...env, ...watcherSupervisor.envOverrides },
        stdio: 'inherit',
      },
      ownedPidFiles: [watcherSupervisor.pidFile],
    })
  } finally {
    watcherSupervisor.cleanup()
  }
}

const entrypoint = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : null

if (entrypoint === import.meta.url) {
  try {
    process.exitCode = await runDesktopLauncher()
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
