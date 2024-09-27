import crypto from 'crypto';

export function getHexEncodedRandomBytes(length: number): string {
  const bytes = crypto.randomBytes(length);
  return bytes.toString('hex');
}
