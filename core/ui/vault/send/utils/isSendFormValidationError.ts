type SendFormValidationError = {
  message: string
  field: 'amount' | 'address' | 'coin'
}

export const isSendFormValidationError = (
  error: unknown
): error is SendFormValidationError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'field' in error &&
    'message' in error
  )
}
