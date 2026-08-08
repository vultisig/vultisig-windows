import { isLikelyToBeDklsVaultBackup } from '@core/ui/vault/import/utils/isLikelyToBeDklsVaultBackup'
import { UnsupportedVaultBackupFileError } from '@core/ui/vault/import/utils/UnsupportedVaultBackupFileError'
import { vaultBackupResultFromFileContent } from '@core/ui/vault/import/utils/vaultBackupResultFromString'
import {
  getFileExtension,
  getVaultBackupExtension,
  isVaultBackupArchiveExtension,
  VaultBackupExtension,
  vaultBackupExtensions,
} from '@core/ui/vault/import/VaultBackupExtension'
import {
  FileBasedVaultBackupResult,
  FileBasedVaultBackupResultItem,
} from '@core/ui/vault/import/VaultBackupResult'
import { getSevenZip } from '@vultisig/core-mpc/compression/getSevenZip'
import { attempt } from '@vultisig/lib-utils/attempt'
import { readFileAsArrayBuffer } from '@vultisig/lib-utils/file/readFileAsArrayBuffer'

const supportedEntryExtensions = new Set<string>(vaultBackupExtensions)
const zipFileSignatures = [
  [0x50, 0x4b, 0x03, 0x04],
  [0x50, 0x4b, 0x05, 0x06],
  [0x50, 0x4b, 0x07, 0x08],
]

type FileBytesInput = {
  name: string
  size: number
  buffer: ArrayBuffer
}

export const vaultBackupResultFromFile = async (
  file: File
): Promise<FileBasedVaultBackupResult> => {
  const buffer = await readFileAsArrayBuffer(file)

  return vaultBackupResultFromFileBytes({
    name: file.name,
    size: file.size,
    buffer,
  })
}

export const vaultBackupResultFromFileBytes = async ({
  name,
  size,
  buffer,
}: FileBytesInput): Promise<FileBasedVaultBackupResult> => {
  try {
    const extension = getFileExtension(name)

    if (isVaultBackupArchiveExtension(extension) || isZipBuffer(buffer)) {
      return extractVaultBackupsFromArchive({ archiveName: name, buffer })
    }

    const item = createBackupResultItem({
      extension: getVaultBackupExtension(name),
      buffer,
      size,
      name,
    })

    return [item]
  } catch (error) {
    if (error instanceof UnsupportedVaultBackupFileError) {
      throw error
    }

    throw new UnsupportedVaultBackupFileError()
  }
}

const isZipBuffer = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer)

  return zipFileSignatures.some(signature =>
    signature.every((byte, index) => bytes[index] === byte)
  )
}

const createBackupResultItem = ({
  extension,
  buffer,
  name,
  size,
}: {
  extension: VaultBackupExtension
  buffer: ArrayBuffer
  name: string
  size: number
}): FileBasedVaultBackupResultItem => {
  const result = vaultBackupResultFromFileContent({
    value: buffer,
    extension,
  })

  const override = isLikelyToBeDklsVaultBackup({
    size,
    fileName: name,
  })
    ? { libType: 'DKLS' as const }
    : undefined

  return override ? { name, result, override } : { name, result }
}

const toArrayBuffer = (value: Uint8Array) => value.slice().buffer

type CollectFilesRecursivelyInput = {
  fs: Awaited<ReturnType<typeof getSevenZip>>['FS']
  directory: string
}

const collectFilesRecursively = ({
  fs,
  directory,
}: CollectFilesRecursivelyInput): string[] => {
  const entries = fs.readdir(directory)

  return entries.flatMap(entry => {
    if (entry === '.' || entry === '..') {
      return []
    }

    const path = `${directory}/${entry}`
    const stats = fs.stat(path)

    if (fs.isDir(stats.mode)) {
      return collectFilesRecursively({ fs, directory: path })
    }

    return [path]
  })
}

type RemoveDirectoryRecursivelyInput = {
  fs: Awaited<ReturnType<typeof getSevenZip>>['FS']
  directory: string
}

const removeDirectoryRecursively = ({
  fs,
  directory,
}: RemoveDirectoryRecursivelyInput) => {
  const entries = fs.readdir(directory)

  entries.forEach(entry => {
    if (entry === '.' || entry === '..') {
      return
    }

    const path = `${directory}/${entry}`
    const stats = fs.stat(path)

    if (fs.isDir(stats.mode)) {
      removeDirectoryRecursively({ fs, directory: path })
      fs.rmdir(path)
    } else {
      fs.unlink(path)
    }
  })

  fs.rmdir(directory)
}

const sanitizeFsName = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'archive'

const extractVaultBackupsFromArchive = async ({
  archiveName,
  buffer,
}: {
  archiveName: string
  buffer: ArrayBuffer
}): Promise<FileBasedVaultBackupResult> => {
  const sevenZip = await getSevenZip()
  const archiveFsName = `${sanitizeFsName(archiveName)}_${Date.now()}.zip`
  const outputDir = `${archiveFsName}_out`

  sevenZip.FS.writeFile(archiveFsName, new Uint8Array(buffer))
  sevenZip.FS.mkdir(outputDir)

  const cleanup = () => {
    attempt(() =>
      removeDirectoryRecursively({ fs: sevenZip.FS, directory: outputDir })
    )
    attempt(() => sevenZip.FS.unlink(archiveFsName))
  }

  try {
    sevenZip.callMain(['x', archiveFsName, '-y', `-o${outputDir}`])

    const filePaths = collectFilesRecursively({
      fs: sevenZip.FS,
      directory: outputDir,
    })

    const items: FileBasedVaultBackupResult = []

    filePaths.forEach(filePath => {
      const fileName = filePath.split('/').pop() || filePath
      const extension = getFileExtension(fileName)

      if (!supportedEntryExtensions.has(extension)) {
        return
      }

      const content = sevenZip.FS.readFile(filePath)
      items.push(
        createBackupResultItem({
          extension: extension as VaultBackupExtension,
          buffer: toArrayBuffer(content),
          name: fileName,
          size: content.byteLength,
        })
      )
    })

    if (!items.length) {
      throw new Error('No supported vault backups found in the archive')
    }

    return items
  } finally {
    cleanup()
  }
}
