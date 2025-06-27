import { ChangeEvent, ClipboardEvent, KeyboardEvent, useRef } from 'react'

type UseOtpArgs = {
  length: number
  value: string | null
  onChange: (v: string | null) => void
  onCompleted?: (v: string) => void
}

export const useOtp = ({
  length,
  value,
  onChange,
  onCompleted,
}: UseOtpArgs) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const chars = (() => {
    const arr = (value ?? '').split('')
    while (arr.length < length) arr.push('')
    return arr
  })()

  const commit = (next: string[]) => {
    const joined = next.join('')
    const filled = next.every(c => c !== '')
    onChange(filled ? joined : null)
    if (filled) onCompleted?.(joined)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>, idx: number) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1) // last numeric
    if (!digit) return

    const next = [...chars]
    next[idx] = digit
    commit(next)

    if (idx < length - 1) inputRefs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace' && !chars[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  const handlePaste = async (event?: ClipboardEvent<HTMLInputElement>) => {
    try {
      let text = ''
      if (event) {
        event.preventDefault()
        text = event.clipboardData.getData('text')
      } else {
        text = await navigator.clipboard.readText()
      }

      const digits = text.replace(/\D/g, '').slice(0, length).split('')
      if (!digits.length) return

      const next = [...chars]
      digits.forEach((d, i) => (next[i] = d))
      commit(next)

      const firstEmpty = next.findIndex(c => !c)
      const idx = firstEmpty === -1 ? length - 1 : firstEmpty
      inputRefs.current[idx]?.focus()
    } catch (err) {
      console.error('Clipboard read failed', err)
    }
  }

  return {
    chars,
    handleChange,
    handleKeyDown,
    handlePaste,
    inputRefs,
  }
}
