import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// The toolbar popup opens on index.html, and everything that document loads
// statically (the entry script plus every modulepreload) is fetched and
// evaluated before home can paint. Pages must reach the bundle through the
// dynamic imports in the view registries, so this budget fails the build when
// a static import drags them back onto the first-paint path. The graph measured
// 18.8 MB with every page in it, 14.1 MB after the view split, and 8.2 MB once
// the SDK and the WalletCore glue moved behind loadMpcEngine / loadWalletCore
// (the Vite build also rejects those two packages in the graph by module id);
// raise the budget only for code that genuinely belongs on home. popup.html,
// the dApp request window, measured 14.97 MB before its screens moved behind
// dynamic imports and 6.56 MB after.
//
// The Firefox build groups each package into one vendor chunk, which keeps
// WalletCore on the static path through the core-mpc and core-chain chunks
// (see vite.config.ts), so it gets its own, looser budget; it measured 11.2 MB
// with WalletCore static and the SDK still loaded on demand.
const isFirefoxBuild = process.env.VULTISIG_EXTENSION_TARGET === 'firefox'
const maxEntryGraphBytes = (isFirefoxBuild ? 12 : 9) * 1024 * 1024

const brand = process.argv[2] ?? 'vultisig'
const currentDir = path.dirname(fileURLToPath(import.meta.url))
const artifactDirectory = brand === 'station' ? 'dist-station' : 'dist'
const distDir = path.resolve(currentDir, '..', artifactDirectory)

const formatMb = bytes => `${(bytes / 1024 / 1024).toFixed(2)} MB`

// popup.html (the dApp request window) shares the shell, so it shares the budget.
const checkEntryGraph = async htmlFile => {
  const html = await readFile(path.resolve(distDir, htmlFile), 'utf8')

  const entryGraphFiles = [
    ...html.matchAll(
      /<script[^>]*\ssrc="([^"]+)"|<link[^>]*rel="modulepreload"[^>]*\shref="([^"]+)"/g
    ),
  ].map(match => match[1] ?? match[2])

  if (entryGraphFiles.length === 0) {
    throw new Error(`No entry script found in ${path.join(distDir, htmlFile)}`)
  }

  const sizes = await Promise.all(
    entryGraphFiles.map(async file => {
      const { size } = await stat(path.resolve(distDir, file.replace(/^\//, '')))

      return { file, size }
    })
  )

  const total = sizes.reduce((sum, { size }) => sum + size, 0)

  console.log(
    `Entry graph (${artifactDirectory}/${htmlFile}${isFirefoxBuild ? ', firefox' : ''}):`
  )
  for (const { file, size } of sizes) {
    console.log(`  ${formatMb(size).padStart(10)}  ${file}`)
  }
  console.log(
    `  ${formatMb(total).padStart(10)}  total (budget ${formatMb(maxEntryGraphBytes)})`
  )

  return total > maxEntryGraphBytes
    ? `The ${htmlFile} entry graph is ${formatMb(total)}, over the ${formatMb(
        maxEntryGraphBytes
      )} budget. A page module is probably imported statically on the first-paint path; keep pages and popup screens behind the dynamic imports in their registries.`
    : null
}

const failures = []
for (const htmlFile of ['index.html', 'popup.html']) {
  const failure = await checkEntryGraph(htmlFile)
  if (failure) failures.push(failure)
}

if (failures.length > 0) {
  throw new Error(failures.join('\n'))
}
