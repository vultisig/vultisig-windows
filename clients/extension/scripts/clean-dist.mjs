import { rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const distPath = path.resolve(currentDir, '../dist')

await rm(distPath, { force: true, recursive: true })
