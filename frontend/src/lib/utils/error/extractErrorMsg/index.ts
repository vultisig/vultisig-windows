import { attempt } from '../../attempt';
import { getUserFriendlyErrorMessageIfExistent } from '../getUserFriendlyErrorMessageIfExistent';

/**
 * Extracts and returns a human-readable error message from an unknown error object.
 *
 * @param {unknown} err - The error object to extract the message from.
 * @returns {string} The extracted error message.
 */
export const extractErrorMsg = (err: unknown): string => {
  if (typeof err === 'string') {
    return getUserFriendlyErrorMessageIfExistent(err);
  }

  if (typeof err === 'number' || typeof err === 'boolean') {
    return String(err);
  }

  if (typeof err === 'object' && err && 'message' in err) {
    return extractErrorMsg((err as { message: unknown }).message);
  }

  return attempt(() => JSON.stringify(err), '');
};
