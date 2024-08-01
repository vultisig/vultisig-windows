export const isBase64Encoded = (str: string): boolean => {
  // Regular expression to check if the string is base64
  const base64Regex =
    /^(?:[A-Za-z0-9+/]{4})*?(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

  // Check if the string matches the base64 pattern
  return base64Regex.test(str);
};

export const stringToUint8Array = (str: string): Uint8Array => {
  return new Uint8Array(new Uint8Array(new TextEncoder().encode(str)));
};

export const uint8ArrayToBase64 = (arr: Uint8Array): string => {
  return btoa(String.fromCharCode(...arr));
};

export const decryptVault = async (
  passwd: string,
  encryptedVault: Uint8Array
): Promise<Uint8Array | null> => {
  try {
    // Derive a key from the password
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(passwd),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    const key = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: new Uint8Array(16), // Use a salt of your choice or derive from your data
        iterations: 100000, // Iterations count for PBKDF2
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["decrypt"]
    );

    // Extract the nonce size
    const nonceSize = 12; // AES-GCM standard nonce size is 12 bytes
    if (encryptedVault.length < nonceSize) {
      throw new Error("Ciphertext too short");
    }

    // Extract the nonce and ciphertext from the encrypted vault
    const nonce = encryptedVault.slice(0, nonceSize);
    const ciphertext = encryptedVault.slice(nonceSize);

    // Decrypt the data
    const decryptedArrayBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: nonce,
      },
      key,
      ciphertext
    );

    return new Uint8Array(decryptedArrayBuffer);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};
