import { memoizeAsync } from '@lib/utils/memoizeAsync'
import SevenZip from '7z-wasm'

export const getSevenZip = memoizeAsync(() => {
  return SevenZip({
    locateFile: (file: any) => `/7z-wasm/${file}`,
  }).catch(() => SevenZip())
})
