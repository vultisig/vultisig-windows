type StartsWithBytesInput = {
  bytes: Uint8Array
  prefix: Uint8Array
}

/** Whether `bytes` begins with every byte of `prefix`. */
export const startsWithBytes = ({ bytes, prefix }: StartsWithBytesInput) =>
  bytes.length >= prefix.length &&
  prefix.every((byte, index) => bytes[index] === byte)

type EndsWithBytesInput = {
  bytes: Uint8Array
  suffix: Uint8Array
}

/** Whether `bytes` ends with every byte of `suffix`. */
export const endsWithBytes = ({ bytes, suffix }: EndsWithBytesInput) =>
  bytes.length >= suffix.length &&
  suffix.every(
    (byte, index) => bytes[bytes.length - suffix.length + index] === byte
  )
