export class NoSwapRoutesError extends Error {
  constructor() {
    super(`No swap routes found.`)
  }
}
