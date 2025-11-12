type BuildKeysignPayloadErrorType = 'not-enough-funds'

export class BuildKeysignPayloadError extends Error {
  constructor(public readonly type: BuildKeysignPayloadErrorType) {
    super(type)
  }
}
