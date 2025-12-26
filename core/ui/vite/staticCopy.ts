import path from 'path'
import { fileURLToPath } from 'url'
import { normalizePath } from 'vite'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const publicFolderPath = path.resolve(dirname, '../public')

export const getStaticCopyTargets = () => [
  {
    src: normalizePath(
      path.resolve(
        dirname,
        '../../../node_modules/@trustwallet/wallet-core/dist/lib/wallet-core.wasm'
      )
    ),
    dest: '',
  },
  {
    src: normalizePath(
      path.resolve(dirname, '../../../node_modules/7z-wasm/7zz.wasm')
    ),
    dest: '',
  },
  {
    src: normalizePath(
      path.resolve(
        dirname,
        '../../../node_modules/zxing-wasm/dist/reader/zxing_reader.wasm'
      )
    ),
    dest: '',
  },
  {
    src: normalizePath(`${publicFolderPath}/**/*`),
    dest: 'core',
    rename: (fileName: string, fileExtension: string, fullPath: string) => {
      const relativePath = path.relative(
        path.resolve(dirname, publicFolderPath),
        fullPath
      )
      return relativePath
    },
  },
]
