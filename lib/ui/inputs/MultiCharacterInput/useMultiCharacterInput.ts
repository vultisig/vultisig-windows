import {
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react'

type UseMultiCharacterInputArgs = {
  length: number
  value: string | null
  onChange: (v: string | null) => void
  isDisabled: boolean
}

export const useMultiCharacterInput = ({
  length,
  value,
  onChange,
  isDisabled,
}: UseMultiCharacterInputArgs) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const refCallbacksRef = useRef<
    Map<number, (el: HTMLInputElement | null) => void>
  >(new Map())

  const getRefCallback = (idx: number) => {
    let callback = refCallbacksRef.current.get(idx)
    if (!callback) {
      callback = (el: HTMLInputElement | null) => {
        inputRefs.current[idx] = el
      }
      refCallbacksRef.current.set(idx, callback)
    }
    return callback
  }

  const [digits, setDigits] = useState<string[]>(() => {
    const arr = (value ?? '').split('')
    while (arr.length < length) arr.push('')
    return arr
  })

  useEffect(() => {
    if (!value) setDigits(Array(length).fill(''))
  }, [value, length])

  // Disabling the inputs while the parent verifies the entry drops focus from
  // the cell being typed in. Once they are enabled again put it on the cell the
  // user would type into next: the first one when the entry was cleared,
  // otherwise the last one so Backspace works on a rejected entry. The target
  // comes from the value prop, not the digits state, because the parent may
  // clear the value in the same render that re-enables the inputs.
  const wasDisabledRef = useRef(isDisabled)
  useEffect(() => {
    const wasDisabled = wasDisabledRef.current
    wasDisabledRef.current = isDisabled

    if (!wasDisabled || isDisabled) return

    const idx = value ? Math.min(value.length, length - 1) : 0
    inputRefs.current[idx]?.focus()
  }, [isDisabled, length, value])

  const commit = (next: string[]) => {
    setDigits(next)
    const joined = next.join('')
    onChange(next.some(d => d) ? joined : null)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>, idx: number) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[idx] = digit
    commit(next)

    if (digit && idx < length - 1) inputRefs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key !== 'Backspace') return
    e.preventDefault()

    const next = [...digits]

    if (next[idx]) {
      next[idx] = ''
    } else if (idx > 0) {
      inputRefs.current[idx - 1]?.focus()
      next[idx - 1] = ''
    }

    commit(next)
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

      const pasted = text.replace(/\D/g, '').slice(0, length).split('')
      if (!pasted.length) return

      const next = Array(length).fill('')
      pasted.forEach((d, i) => (next[i] = d))
      commit(next)

      const firstEmpty = next.findIndex(c => !c)
      const idx = firstEmpty === -1 ? length - 1 : firstEmpty
      inputRefs.current[idx]?.focus()
    } catch (err) {
      console.error('Clipboard read failed', err)
    }
  }

  return {
    digits,
    handleChange,
    handleKeyDown,
    handlePaste,
    getRefCallback,
  }
}
