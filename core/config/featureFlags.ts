const KEY = 'blockaidEnabled'

export const isBlockaidEnabled = (): boolean => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? 'true') as boolean
  } catch {
    return true
  }
}
