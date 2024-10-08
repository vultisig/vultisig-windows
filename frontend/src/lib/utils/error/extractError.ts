/**
 * Type guard to check if a value is an instance of Error.
 *
 * @param {Error} e - The value to check.
 * @returns {boolean} True if the value is an Error, false otherwise.
 */
const isError = (e: Error): e is Error => {
  return !!(e && e.stack && e.message);
};

/**
 * Extracts and returns a human-readable error message from an unknown error object.
 *
 * @param {unknown} err - The error object to extract the message from.
 * @returns {string} The extracted error message.
 */
export const extractError = (err: unknown): string => {
  if (typeof err === 'string') {
    return err;
  }
  if (err instanceof Error || isError(err as never)) {
    const message = (err as Error).message || '';
    if (
      message.toLowerCase().indexOf('user rejected action') !== -1 ||
      message.toLowerCase().indexOf('user rejected') !== -1
    ) {
      return 'Action rejected by User';
    }
    if (message === 'SignatureExpired') {
      return 'Signature expired! Please adjust the time in your device.';
    }
    return message;
  }
  return '';
};
