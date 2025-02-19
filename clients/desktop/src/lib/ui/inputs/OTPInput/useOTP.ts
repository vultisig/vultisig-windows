import { ChangeEvent, ClipboardEvent, useRef, useState } from 'react'

export const useOtp = (
  length: number,
  onValueChange?: (value: string) => void,
  onCompleted?: (value: string) => void
) => {
  const [otp, setOtp] = useState(new Array(length).fill(''))
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value
    if (isNaN(Number(value))) return

    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1)
    setOtp(newOtp)

    const otpValue = newOtp.join('')
    onValueChange?.(otpValue)

    if (index === length - 1) {
      onCompleted?.(otpValue)
    }

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
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

      if (!text) return

      const pastedOtp = text.slice(0, length).split('')

      const newOtp = [...otp]
      pastedOtp.forEach((char, index) => {
        newOtp[index] = char
      })

      setOtp(newOtp)
      onValueChange?.(newOtp.join(''))

      if (newOtp.length === length) {
        onCompleted?.(newOtp.join(''))
      }

      const lastFilledIndex = pastedOtp.length - 1
      if (lastFilledIndex < length) {
        inputRefs.current[lastFilledIndex]?.focus()
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err)
    }
  }

  return { otp, handleChange, handleKeyDown, handlePaste, inputRefs }
}
