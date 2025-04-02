const fs = require('fs')
const path = require('path')
const { globSync } = require('glob')

// Root folder where the script should run from
const PROJECT_ROOT = path.resolve(__dirname, 'clients/desktop')
const LIB_DIR = path.join(PROJECT_ROOT, 'src/lib')

// Only these lib subfolders should be rewritten
const TARGET_SUBFOLDERS = [
  'css',
  'flow',
  'hooks',
  'icons',
  'image',
  'images',
  'buttons',
]
const LIB_ALIAS = '@lib'

function shouldRewrite(importPath, filePath) {
  if (!importPath.startsWith('.')) return false // only relative imports

  const absImportPath = path.resolve(path.dirname(filePath), importPath)
  if (!absImportPath.startsWith(LIB_DIR)) return false

  const relativeToLib = path
    .relative(LIB_DIR, absImportPath)
    .replace(/\\/g, '/')
  const segments = relativeToLib.split('/')

  // Match if first or second folder is one of the target subfolders
  return (
    TARGET_SUBFOLDERS.includes(segments[0]) ||
    TARGET_SUBFOLDERS.includes(segments[1])
  )
}

function getAliasedPath(importPath, filePath) {
  const absImportPath = path.resolve(path.dirname(filePath), importPath)
  const relativeToLib = path
    .relative(LIB_DIR, absImportPath)
    .replace(/\\/g, '/')
  return `${LIB_ALIAS}/${relativeToLib}`
}

function processFile(filePath) {
  const originalContent = fs.readFileSync(filePath, 'utf8')
  let modified = false

  const updatedContent = originalContent.replace(
    /from\s+['"]([^'"]+)['"]/g,
    (match, importPath) => {
      if (shouldRewrite(importPath, filePath)) {
        const newImportPath = getAliasedPath(importPath, filePath)
        modified = true
        return match.replace(importPath, newImportPath)
      }
      return match
    }
  )

  if (modified) {
    fs.writeFileSync(filePath, updatedContent, 'utf8')
    console.log('Fixed:', filePath)
  }
}

const files = globSync(`${PROJECT_ROOT}/src/**/*.ts?(x)`)
files.forEach(processFile)
