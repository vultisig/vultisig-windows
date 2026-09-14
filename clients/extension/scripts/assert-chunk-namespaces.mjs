import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// The app, background, content and inpage builds all write into dist/assets.
// The app owns the bare chunk names; every other build prefixes its chunks
// with its own name (see chunkFileNames in vite.config.ts). This checks the
// service worker really only loads prefixed chunks, so an app chunk can never
// be overwritten by a same-named chunk from a later build again.
const brand = process.argv[2] ?? 'vultisig'
const currentDir = path.dirname(fileURLToPath(import.meta.url))
const artifactDirectory = brand === 'station' ? 'dist-station' : 'dist'
const distDir = path.resolve(currentDir, '..', artifactDirectory)

const background = await readFile(
  path.resolve(distDir, 'background.js'),
  'utf8'
)

const referencedChunks = [
  ...new Set(
    [...background.matchAll(/["'`]\.\/assets\/([^"'`]+\.js)["'`]/g)].map(
      match => match[1]
    )
  ),
]

const unprefixed = referencedChunks.filter(
  chunk => !chunk.startsWith('background-')
)

if (unprefixed.length > 0) {
  throw new Error(
    `background.js loads chunks that are not namespaced to the background build, so they can collide with the app's chunks: ${unprefixed.join(', ')}`
  )
}

const assetFiles = await readdir(path.resolve(distDir, 'assets'))
const backgroundChunks = assetFiles.filter(file =>
  file.startsWith('background-')
)

console.log(
  `Chunk namespaces OK (${artifactDirectory}): background.js loads ${referencedChunks.length} chunk(s), ${backgroundChunks.length} background-* chunk(s) on disk.`
)
