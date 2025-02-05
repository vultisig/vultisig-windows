import { ChangeEvent, useState } from 'react';

export const useOtp = (
  length: number,
  onValueChange?: (value: string) => void,
  onCompleted?: (value: string) => void
) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    const otpValue = newOtp.join('');
    onValueChange?.(otpValue);

    if (index === length - 1) {
      onCompleted?.(otpValue);
    }

    if (value && index < length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      const pastedOtp = text.slice(0, length).split('');
      setOtp(pastedOtp);
      onValueChange?.(pastedOtp.join(''));
      if (pastedOtp.length === length) {
        onCompleted?.(pastedOtp.join(''));
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  return { otp, handleChange, handleKeyDown, handlePaste };
};
