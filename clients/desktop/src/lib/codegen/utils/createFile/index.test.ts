import fs from 'fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createFile } from '.'

vi.mock('fs')

describe('createFile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create the directory if it does not exist', () => {
    const mkdirSyncMock = vi.spyOn(fs, 'mkdirSync')
    const params = {
      directory: './test-dir',
      fileName: 'test',
      content: 'Hello, world!',
      extension: 'txt',
    }

    createFile(params)

    expect(mkdirSyncMock).toHaveBeenCalledWith('./test-dir', {
      recursive: true,
    })
  })

  it('should write the file with the correct content', () => {
    const writeFileSyncMock = vi.spyOn(fs, 'writeFileSync')
    const params = {
      directory: './test-dir',
      fileName: 'test',
      content: 'Hello, world!',
      extension: 'txt',
    }

    createFile(params)

    expect(writeFileSyncMock).toHaveBeenCalledWith(
      './test-dir/test.txt',
      'Hello, world!'
    )
  })

  it('should handle different file extensions', () => {
    const writeFileSyncMock = vi.spyOn(fs, 'writeFileSync')
    const params = {
      directory: './another-dir',
      fileName: 'sample',
      content: 'Test content',
      extension: 'json',
    }

    createFile(params)

    expect(writeFileSyncMock).toHaveBeenCalledWith(
      './another-dir/sample.json',
      'Test content'
    )
  })
})
