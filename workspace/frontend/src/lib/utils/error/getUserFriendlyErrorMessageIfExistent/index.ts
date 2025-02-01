export const getUserFriendlyErrorMessageIfExistent = (errorMsg: string) => {
  const normalizedError = errorMsg.toLowerCase();

  switch (true) {
    case normalizedError.includes(
      'transaction simulation failed: blockhash not found'
    ):
      return 'Transaction timed out due to slow signing. Please try again.';
    case normalizedError === 'signatureexpired':
      return 'Signature expired! Please adjust the time in your device.';
    case normalizedError.includes('user rejected action') ||
      normalizedError.includes('user rejected'):
      return 'Action rejected by User.';
    default:
      return errorMsg;
  }
};
