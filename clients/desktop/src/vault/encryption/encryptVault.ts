import crypto from 'crypto';

type Input = {
  password: string;
  vault: Buffer;
};

export const encryptVault = ({ password, vault }: Input): Buffer => {
  // Hash the password to create a key
  const key = crypto.createHash('sha256').update(password).digest();

  // Generate a random nonce (12 bytes for GCM)
  const nonce = crypto.randomBytes(12);

  // Create a new AES cipher using the key and nonce
  const cipher = crypto.createCipheriv('aes-256-gcm', key, nonce);

  // Encrypt the vault
  const ciphertext = Buffer.concat([cipher.update(vault), cipher.final()]);

  // Get the authentication tag (16 bytes)
  const authTag = cipher.getAuthTag();

  // Combine nonce, ciphertext, and authTag into a single buffer
  return Buffer.concat([nonce, ciphertext, authTag]);
};
