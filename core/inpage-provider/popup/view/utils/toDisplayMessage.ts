import { attempt } from '@lib/utils/attempt'
import { hexlify } from 'ethers'

const hasBadControl = (s: string): boolean => {
  for (const ch of s) {
    const cp = ch.codePointAt(0)!
    if (
      (cp <= 0x1f && cp !== 0x09 && cp !== 0x0a && cp !== 0x0d) ||
      cp === 0x7f
    ) {
      return true
    }
  }
  return false
}

const printableRatio = (s: string): number => {
  if (!s.length) return 0
  let printable = 0
  for (const ch of s) {
    if (ch >= ' ' && ch <= '~') printable++
  }
  return printable / s.length
}

export const toDisplayMessageString = (bytes: Uint8Array): string => {
  const { data: displayMessage } = attempt(() => {
    const s = new TextDecoder('utf-8', { fatal: true }).decode(bytes)

    const badCtrl = hasBadControl(s)
    const ratio = printableRatio(s)

    if (!badCtrl && (ratio >= 0.9 || s.length <= 200)) {
      return s
    }
  })

  return displayMessage ?? hexlify(bytes)
}
