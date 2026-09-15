import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// The app, background, content and inpage builds all write into dist/assets.
// The app owns the bare chunk names; every other build prefixes its chunks
// with its own name (see chunkFileNames in vite.config.ts). This checks each
// of those entries really only loads prefixed chunks, so an app chunk can
// never be overwritten by a same-named chunk from a later build again.
const brand = process.argv[2] ?? 'vultisig'
const currentDir = path.dirname(fileURLToPath(import.meta.url))
const artifactDirectory = brand === 'station' ? 'dist-station' : 'dist'
const distDir = path.resolve(currentDir, '..', artifactDirectory)

const secondaryEntries = ['background', 'content', 'inpage']
const assetFiles = await readdir(path.resolve(distDir, 'assets'))

const summaries = await Promise.all(
  secondaryEntries.map(async entry => {
    const source = await readFile(path.resolve(distDir, `${entry}.js`), 'utf8')
    const referencedChunks = [
      ...new Set(
        [...source.matchAll(/["'`]\.\/assets\/([^"'`]+\.js)["'`]/g)].map(
          match => match[1]
        )
      ),
    ]
    const unprefixed = referencedChunks.filter(
      chunk => !chunk.startsWith(`${entry}-`)
    )

    if (unprefixed.length > 0) {
      throw new Error(
        `${entry}.js loads chunks that are not namespaced to the ${entry} build, so they can collide with the app's chunks: ${unprefixed.join(', ')}`
      )
    }

    const onDisk = assetFiles.filter(file =>
      file.startsWith(`${entry}-`)
    ).length

    return `${entry}.js loads ${referencedChunks.length} chunk(s), ${onDisk} ${entry}-* on disk`
  })
)

console.log(
  `Chunk namespaces OK (${artifactDirectory}): ${summaries.join('; ')}.`
)
