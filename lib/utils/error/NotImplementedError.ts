export class NotImplementedError extends Error {
  constructor(functionality: string) {
    super(`Not implemented: ${functionality}`)
  }
}
