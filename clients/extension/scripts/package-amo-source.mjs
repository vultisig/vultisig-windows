import { execFileSync } from 'node:child_process'
import {
  access,
  copyFile,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

// AMO reviewer source package: no .yarn/releases binary, no minified JS.
// Usage: yarn workspace @clients/extension package:firefox-source [out.zip] (needs the zip CLI)

const excludedPrefix = '.yarn/releases/'
const yarnConfigFile = '.yarnrc.yml'
const readmeFile = 'AMO-BUILD-README.md'
const scannedExtensions = ['.js', '.cjs', '.mjs', '.mts', '.cts']
const maxSourceLineLength = 1000

const repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  encoding: 'utf8',
}).trim()

const git = args =>
  execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' }).trim()
const readRepoFile = file => readFile(path.join(repoRoot, file), 'utf8')

const outputPath = path.resolve(
  process.env.INIT_CWD ?? process.cwd(),
  process.argv[2] ??
    path.join(repoRoot, 'clients/extension/firefox-amo-source.zip')
)

const listFiles = args =>
  git(['ls-files', '-z', ...args])
    .split('\0')
    .filter(Boolean)

// The reviewer rebuilds from this archive alone, so anything the local build
// reads that the archive lacks makes the two bundles differ.
const untrackedFiles = listFiles(['--others', '--exclude-standard'])
if (untrackedFiles.length > 0) {
  throw new Error(
    `Untracked files would be missing from the source package:\n${untrackedFiles.join('\n')}`
  )
}
const hasRootEnv = await access(path.join(repoRoot, '.env')).then(
  () => true,
  () => false
)
if (hasRootEnv) {
  throw new Error(
    'vite.config.ts loads the root .env, which the source package excludes. Build and package from a checkout without one.'
  )
}

const deletedFiles = new Set(listFiles(['--deleted']))
const files = listFiles([]).filter(
  file => !file.startsWith(excludedPrefix) && !deletedFiles.has(file)
)

const findMinifiedFiles = async () => {
  const scripts = files.filter(file =>
    scannedExtensions.includes(path.extname(file))
  )
  const contents = await Promise.all(scripts.map(readRepoFile))
  return scripts.filter((_, index) =>
    contents[index].split('\n').some(line => line.length > maxSourceLineLength)
  )
}

const minifiedFiles = await findMinifiedFiles()
if (minifiedFiles.length > 0) {
  throw new Error(
    `AMO rejects minified source. Lines over ${maxSourceLineLength} characters in:\n${minifiedFiles.join('\n')}`
  )
}

const yarnConfig = (await readRepoFile(yarnConfigFile)).replace(
  /^yarnPath:.*$\n?/m,
  ''
)
if (yarnConfig.includes('yarnPath')) {
  throw new Error(`Could not remove yarnPath from ${yarnConfigFile}`)
}
const nodeVersion = (await readRepoFile('.nvmrc')).trim()
const { packageManager } = JSON.parse(await readRepoFile('package.json'))
const workingTreeChanges = git([
  'status',
  '--porcelain',
  '--untracked-files=no',
])
  .split('\n')
  .filter(Boolean)
const changeList = (
  workingTreeChanges.length > 0 ? workingTreeChanges : ['none']
)
  .map(change => `   - \`${change.trim()}\``)
  .join('\n')

const readme = `# Reviewer build instructions — Vultisig Firefox add-on

This archive is the \`vultisig-windows\` monorepo at \`${git(['describe', '--tags', '--always'])}\` (commit \`${git(['rev-parse', 'HEAD'])}\`). The Firefox extension lives in \`clients/extension/\` and depends on the \`core/\` and \`lib/\` workspaces, so the whole monorepo is included. \`node_modules/\` is excluded; the dependency tree is pinned by \`yarn.lock\`.

The add-on version is the \`version\` in the submitted package's \`manifest.json\`.

## Differences from the commit

1. \`${excludedPrefix}\` is removed. It holds the prebuilt Yarn binary, not our code. Corepack installs \`${packageManager}\` from the \`packageManager\` field in \`package.json\` instead.
2. \`${yarnConfigFile}\`: the \`yarnPath\` line pointing at that binary is removed.
3. Working-tree changes to tracked files:
${changeList}

No JavaScript file in this archive has a line over ${maxSourceLineLength} characters. \`clients/desktop/wailsjs/\` holds small Wails-generated bindings for the separate desktop app; they are not used by the add-on and stay only because \`clients/desktop\` is a workspace in \`yarn.lock\`.

## Build environment

- Node.js ${nodeVersion} (\`.nvmrc\`)
- ${packageManager} via Corepack
- No root \`.env\` (\`vite.config.ts\` would load it)

## Steps

\`\`\`bash
corepack enable
corepack install
yarn install --immutable
yarn build:extension:firefox
\`\`\`

The build emits \`clients/extension/dist/\`. The submitted add-on is the contents of that directory, zipped with \`manifest.json\` at the top of the archive.
`

// The archive is built in a temp dir and copied out at the end, so a failed
// run never leaves a partial package at the output path.
const stagingDir = await mkdtemp(path.join(tmpdir(), 'amo-source-'))
try {
  const stagedZip = path.join(stagingDir, 'source.zip')
  await writeFile(path.join(stagingDir, yarnConfigFile), yarnConfig)
  await writeFile(path.join(stagingDir, readmeFile), readme)
  execFileSync('zip', ['-q', '-X', '-nw', stagedZip, '-@'], {
    cwd: repoRoot,
    input: files.filter(file => file !== yarnConfigFile).join('\n'),
  })
  execFileSync('zip', [
    '-q',
    '-X',
    '-j',
    stagedZip,
    path.join(stagingDir, yarnConfigFile),
    path.join(stagingDir, readmeFile),
  ])
  await copyFile(stagedZip, outputPath)
} finally {
  await rm(stagingDir, { recursive: true })
}

console.log(`AMO source package: ${outputPath} (${files.length} files)`)
