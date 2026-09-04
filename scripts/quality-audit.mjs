/**
 * `quality:audit` gate (invoked from `quality:health`).
 *
 * Advisory suppressions are declared here — with dependency path, rationale,
 * owner, and a review-by date — instead of as bare `--ignore` flags in
 * package.json, which is JSON and cannot carry that context. Every entry must
 * justify why the advisory is tolerated; if one cannot, delete it and upgrade
 * or remediate the affected transitive dependency instead.
 *
 * A suppression whose `reviewBy` date has passed is surfaced as a warning so
 * stale exceptions get revisited rather than silently lingering. Flip the
 * warning to a hard failure if the team wants a strict expiry gate.
 *
 * Run: `node scripts/quality-audit.mjs` (add `--print` to only echo the
 * resolved command without contacting the registry).
 */
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

/**
 * @typedef {Object} AuditSuppression
 * @property {number} id        npm-audit advisory id passed to `--ignore`
 * @property {string} advisory  upstream GHSA identifier (or "unknown")
 * @property {string} package   affected transitive package
 * @property {string} path      dependency path that pulls it in
 * @property {string} reason    why the advisory is tolerated here
 * @property {string} owner     team/person accountable for the exception
 * @property {string} reviewBy  YYYY-MM-DD date to re-evaluate the suppression
 */

/** @type {AuditSuppression[]} */
const suppressions = [
  {
    id: 1103747,
    advisory: 'GHSA-3gc7-fjrx-p6mg',
    package: 'bigint-buffer',
    path: '@solana/buffer-layout-utils > bigint-buffer',
    reason:
      'Buffer overflow via toBigIntLE() in bigint-buffer (<=1.1.5), a transitive dep pulled in through the Solana SDK (@solana/buffer-layout-utils). The package is unmaintained and 1.1.5 is its latest release, so there is no fixed version to upgrade to. Inherited from #4352; suppression retained until a maintained replacement is available upstream.',
    owner: 'vultisig/windows',
    reviewBy: '2026-10-01',
  },
  {
    id: 1124012,
    advisory: 'GHSA-v245-v573-v5vm',
    package: 'linkify-it',
    path: 'markdown-it > linkify-it',
    reason:
      'Quadratic-complexity ReDoS in the mailto: validator scan-loop. Reachable only from Markdown/dev tooling (markdown-it), never bundled into the shipped desktop/extension runtime. No fixed linkify-it (>5.0.1) is resolvable in our dependency tree yet.',
    owner: 'vultisig/windows',
    reviewBy: '2026-10-01',
  },
  {
    id: 1124334,
    advisory: 'GHSA-mh99-v99m-4gvg',
    package: 'brace-expansion',
    path: 'minimatch@3.1.5 > brace-expansion',
    reason:
      'False positive: the advisory range ("<=5.0.7") is written against the current 5.x line, but npm audit compares it numerically against our tree version 1.1.16, which belongs to the separately maintained legacy v1 line (npm dist-tag maintenance-v1). 1.1.16 was published 2026-07-23, the day before this advisory, as the v1-line maintenance fix. No newer 1.x release exists to upgrade to.',
    owner: 'vultisig/windows',
    reviewBy: '2026-10-01',
  },
]

const today = new Date().toISOString().slice(0, 10)
for (const { id, package: pkg, reviewBy } of suppressions) {
  if (reviewBy < today) {
    console.warn(
      `⚠ audit suppression ${id} (${pkg}) is past its review-by date ${reviewBy} — re-evaluate or upgrade the dependency.`
    )
  }
}

const args = [
  'npm',
  'audit',
  '--recursive',
  '--all',
  '--severity',
  'high',
  ...suppressions.flatMap(({ id }) => ['--ignore', String(id)]),
]

const socketTimeoutPattern = /RequestError: Timeout awaiting 'socket' for \d+ms/
const retryDelaysMs = [2_000, 15_000, 45_000, 90_000]

if (process.argv.includes('--print')) {
  console.log(`yarn ${args.join(' ')}`)
} else {
  const isMain = fileURLToPath(import.meta.url) === process.argv[1]
  if (isMain) {
    try {
      await runAudit()
    } catch (error) {
      console.error(error.message)
      process.exitCode = error.status ?? 1
    }
  }
}

export async function runAudit({
  run = spawnSync,
  wait = milliseconds =>
    new Promise(resolve => setTimeout(resolve, milliseconds)),
  stdout = process.stdout,
  stderr = process.stderr,
} = {}) {
  const yarn = process.platform === 'win32' ? 'yarn.cmd' : 'yarn'

  const maxAttempts = retryDelaysMs.length + 1
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const result = run(yarn, args, {
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    })
    if (result.stdout) stdout.write(result.stdout)
    if (result.stderr) stderr.write(result.stderr)
    if (result.error) throw result.error
    if (result.status === 0) return

    const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`
    const shouldRetry =
      attempt < maxAttempts && socketTimeoutPattern.test(output)
    if (!shouldRetry) {
      const error = new Error(
        `yarn quality:audit exited with code ${result.status}`
      )
      error.status = result.status ?? 1
      throw error
    }

    const retryDelayMs = retryDelaysMs[attempt - 1]
    stderr.write(
      `Transient Yarn registry socket timeout; retrying audit in ${retryDelayMs / 1_000} seconds (attempt ${attempt + 1}/${maxAttempts}).\n`
    )
    await wait(retryDelayMs)
  }
}
