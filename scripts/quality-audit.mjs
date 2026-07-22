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
import { execFileSync } from 'node:child_process'

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
    id: 1124015,
    advisory: 'GHSA-4c8g-83qw-93j6',
    package: 'fast-uri',
    path: 'ajv > fast-uri',
    reason:
      'Host confusion via failed IDN canonicalization. fast-uri is a transitive dep of ajv (JSON-schema tooling); the affected URI host-parsing path is not exercised by our usage. No patched fast-uri (>3.1.3) is resolvable in our dependency tree yet.',
    owner: 'vultisig/windows',
    reviewBy: '2026-10-01',
  },
  {
    id: 1124064,
    advisory: 'GHSA-v2hh-gcrm-f6hx',
    package: 'fast-uri',
    path: 'ajv > fast-uri',
    reason:
      'Host confusion via a literal backslash authority delimiter — same package and path as 1124015; suppressed together pending the same fast-uri upgrade.',
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

if (process.argv.includes('--print')) {
  console.log(`yarn ${args.join(' ')}`)
  process.exit(0)
}

execFileSync('yarn', args, { stdio: 'inherit' })
