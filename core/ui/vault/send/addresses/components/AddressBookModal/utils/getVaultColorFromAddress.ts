const colors = [
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#6366F1',
  '#EC4899',
  '#F43F5E',
  '#8B5CF6',
  '#14B8A6',
]

export function getVaultColorFromAddress(address: string): string {
  let hash = 0
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}
