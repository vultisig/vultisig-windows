export const getPluginIcon = (name?: string): string => {
  const lower = name?.toLowerCase() || ''
  if (lower.includes('swap') || lower.includes('dca')) return '🔄'
  if (lower.includes('send')) return '📤'
  if (lower.includes('fee')) return '💰'
  if (lower.includes('payroll')) return '💵'
  return '🔌'
}
