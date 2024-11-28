import crypto from 'crypto';

type Input = {
  password: string;
  vault: Buffer;
};

export const decryptVault = ({ password, vault }: Input) => {
  // Hash the password to create a key
  const key = crypto.createHash('sha256').update(password).digest();

  // Create a new AES cipher using the key
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    vault.subarray(0, 12) // Nonce is the first 12 bytes
  );

  const ciphertext = vault.subarray(12, -16); // Exclude the nonce and the auth tag
  const authTag = vault.subarray(-16); // Last 16 bytes is the auth tag

  // Set the authentication tag
  decipher.setAuthTag(authTag);

  // Decrypt the vault
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
};
