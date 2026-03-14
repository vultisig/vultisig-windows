let initialized = false

export const initializeFromt = async (): Promise<void> => {
  if (initialized) return
  const wasm = await import('../../../lib/fromt/fromt_wasm')
  await wasm.default()
  initialized = true
}
