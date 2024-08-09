import crypto from 'crypto';

export const isBase64Encoded = (str: string): boolean => {
  // Regular expression to check if the string is base64
  const base64Regex =
    /^(?:[A-Za-z0-9+/]{4})*?(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

  // Check if the string matches the base64 pattern
  return base64Regex.test(str);
};

export const decryptVault = (passwd: string, vault: Buffer): Buffer => {
  // Hash the password to create a key
  const key = crypto.createHash('sha256').update(passwd).digest();

  // Create a new AES cipher using the key
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    vault.slice(0, 12)
  );

  // Extract the nonce from the vault
  // const nonce = vault.slice(0, 12);
  const ciphertext = vault.slice(12, -16); // Exclude the nonce and the auth tag
  const authTag = vault.slice(-16); // Last 16 bytes is the auth tag

  // Set the authentication tag
  decipher.setAuthTag(authTag);

  // Decrypt the vault
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted;
};


export function generateRandomNumber(): number {
  return Math.floor(Math.random() * 900) + 100;
}