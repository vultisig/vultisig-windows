/**
 * Extracts and returns a human-readable error message from an unknown error object.
 *
 * @param {unknown} err - The error object to extract the message from.
 * @returns {string} The extracted error message.
 */
export const extractErrorMsg = (err: unknown): string => {
  if (typeof err === 'string') {
    if (
      err.toLowerCase().indexOf('user rejected action') !== -1 ||
      err.toLowerCase().indexOf('user rejected') !== -1
    ) {
      return 'Action rejected by User';
    }
    if (err === 'SignatureExpired') {
      return 'Signature expired! Please adjust the time in your device.';
    }

    return err;
  }

  if (typeof err === 'object' && err && 'message' in err) {
    return extractErrorMsg(err.message);
  }

  return JSON.stringify(err);
};
