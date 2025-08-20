export class CancelPopupCallError extends Error {
  constructor() {
    super('Popup call cancelled')
  }
}
